#from flask_socketio import join_room, leave_room, emit
#from flask_jwt_extended import decode_token
#from app import socketio

#@socketio.on("join_ticket")
#def join_ticket(data):
#    ticket_id = data["ticket_id"]
#    join_room(f"ticket_{ticket_id}")
#
#@socketio.on("leave_ticket")
#def leave_ticket(data):
#    ticket_id = data["ticket_id"]
#    leave_room(f"ticket_{ticket_id}")
