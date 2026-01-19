from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.extensions import db
from app.utils.permissions import admin_required
from app.models import Ticket, User, TicketHistory, TicketComment, Notification

tickets_bp = Blueprint("tickets", __name__, url_prefix="/tickets")


@tickets_bp.route("", methods=["POST"])
@jwt_required()
def create_ticket():
    data = request.get_json()
    user_id = get_jwt_identity()

    ticket = Ticket(
        title=data.get("title"),
        description=data.get("description"),
        user_id=user_id
    )

    db.session.add(ticket)
    db.session.commit()

    return jsonify({"message": "Ticket creado"}), 201


@tickets_bp.route("", methods=["GET"])
@jwt_required()
def my_tickets():
    user_id = get_jwt_identity()

    tickets = Ticket.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "created_at": t.created_at.isoformat()
        }
        for t in tickets
    ])


@tickets_bp.route("/all", methods=["GET"])
@jwt_required()
@admin_required()
def all_tickets():
    tickets = Ticket.query.all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "user_id": t.user_id,
            "created_at": t.created_at.isoformat()
        }
        for t in tickets
    ])


@tickets_bp.route("/<int:ticket_id>/status", methods=["PUT"])
@jwt_required()
@admin_required()
def change_ticket_status(ticket_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["open", "in_progress", "closed"]:
        return {"error": "Estado inválido"}, 400

    ticket = Ticket.query.get_or_404(ticket_id)
    old_status = ticket.status
    ticket.status = status

    history = TicketHistory(
        ticket_id=ticket.id,
        user_id=get_jwt_identity(),
        action="status_change",
        old_value=old_status,
        new_value=status
    )

    db.session.add(history)
    db.session.commit()

    return {"message": "Estado actualizado correctamente"}, 200


@tickets_bp.route("/<int:ticket_id>/assign", methods=["PUT"])
@jwt_required()
@admin_required()
def assign_ticket(ticket_id):
    data = request.get_json()
    agent_id = data.get("agent_id")

    if not agent_id:
        return jsonify({"msg": "agent_id es requerido"}), 400

    ticket = Ticket.query.get_or_404(ticket_id)
    agent = User.query.get_or_404(agent_id)

    if agent.role != "agent":
        return jsonify({"msg": "El usuario no es agente"}), 400

    old_agent = ticket.assigned_to
    ticket.assigned_to = agent.id

    history = TicketHistory(
        ticket_id=ticket.id,
        user_id=get_jwt_identity(),
        action="assign",
        old_value=str(old_agent),
        new_value=str(agent.id)
    )

    db.session.add(history)
    db.session.commit()

    return jsonify({"msg": "Ticket asignado correctamente"})


@tickets_bp.route("/<int:ticket_id>/history", methods=["GET"])
@jwt_required()
def ticket_history(ticket_id):
    history = TicketHistory.query.filter_by(ticket_id=ticket_id).all()

    return jsonify([
        {
            "action": h.action,
            "old_value": h.old_value,
            "new_value": h.new_value,
            "user_id": h.user_id,
            "created_at": h.created_at.isoformat()
        }
        for h in history
    ])


@tickets_bp.route("/<int:ticket_id>/comments", methods=["POST"])
@jwt_required()
def create_comment(ticket_id):
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"msg": "El mensaje es requerido"}), 400

    user_id = get_jwt_identity()
    claims = get_jwt()

    ticket = Ticket.query.get_or_404(ticket_id)

    # 🚫 BLOQUEAR SI EL TICKET ESTÁ CERRADO
    if ticket.status == "closed":
        return jsonify({"msg": "Este ticket está cerrado. No se permiten más comentarios."}), 403

    # 🔐 VALIDACIÓN DE PERMISOS
    if (
        claims.get("role") != "admin"
        and user_id != ticket.user_id
        and user_id != ticket.assigned_to
    ):
        return jsonify({"msg": "No tienes permiso para comentar en este ticket"}), 403

    # 💬 Guardar comentario
    comment = TicketComment(
        ticket_id=ticket.id,
        user_id=user_id,
        message=message
    )
    db.session.add(comment)

    # 🔔 NOTIFICACIONES
    recipients = set()
    recipients.add(ticket.user_id)

    if ticket.assigned_to:
        recipients.add(ticket.assigned_to)

    recipients.discard(user_id)

    for recipient_id in recipients:
        notification = Notification(
            user_id=recipient_id,
            ticket_id=ticket.id,
            message=f"Nuevo comentario en el ticket #{ticket.id}"
        )
        db.session.add(notification)

    db.session.commit()

    return jsonify({"msg": "Comentario agregado correctamente"}), 201


@tickets_bp.route("/<int:ticket_id>/comments", methods=["GET"])
@jwt_required()
def get_comments(ticket_id):
    comments = TicketComment.query.filter_by(ticket_id=ticket_id)\
        .order_by(TicketComment.created_at).all()

    return jsonify([
        {
            "id": c.id,
            "message": c.message,
            "created_at": c.created_at.isoformat(),
            "user": {
                "id": c.user.id,
                "email": c.user.email,
                "role": c.user.role
            }
        }
        for c in comments
    ])


@tickets_bp.route("/notifications", methods=["GET"])
@jwt_required()
def my_notifications():
    user_id = get_jwt_identity()

    notifications = Notification.query.filter_by(
        user_id=user_id,
        is_read=False
    ).order_by(Notification.created_at.desc()).all()

    return jsonify([
        {
            "id": n.id,
            "ticket_id": n.ticket_id,
            "message": n.message,
            "created_at": n.created_at.isoformat() if n.created_at else None
        }
        for n in notifications
    ])


@tickets_bp.route("/assigned", methods=["GET"])
@jwt_required()
def my_assigned_tickets():
    user_id = get_jwt_identity()
    claims = get_jwt()

    # Solo agentes o admin
    if claims.get("role") not in ["agent", "admin"]:
        return jsonify({"msg": "No tienes permisos para ver tickets asignados"}), 403

    tickets = Ticket.query.filter_by(assigned_to=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "user_id": t.user_id,
            "assigned_to": t.assigned_to,
            "created_at": t.created_at.isoformat()
        }
        for t in tickets
    ])


@tickets_bp.route("/notifications/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_read(notification_id):
    user_id = get_jwt_identity()

    notification = Notification.query.get_or_404(notification_id)

    # 🔐 Solo el dueño puede modificarla
    if notification.user_id != user_id:
        return jsonify({"msg": "No puedes modificar esta notificación"}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify({"msg": "Notificación marcada como leída"})

@tickets_bp.route("/agents", methods=["GET"])
@jwt_required()
@admin_required()
def get_agents():
    agents = User.query.filter_by(role="agent").all()
    return jsonify([
        {
            "id": a.id,
            "email": a.email,
            "role": a.role
        }
        for a in agents
    ])
