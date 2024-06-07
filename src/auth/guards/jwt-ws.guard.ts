import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the request context is WebSocket
    if (context.getType() !== 'ws') {
      return true; // If not WebSocket, allow access
    }

    // If it's a WebSocket request, extract the client socket
    const client: Socket = context.switchToWs().getClient();

    // Call the method to validate JWT token
    WsJwtGuard.validateToken(client);

    return true; // Allow access
  }

  // Static method to validate JWT token
  static validateToken(client: Socket) {
    // Extract the JWT token from the WebSocket handshake headers
    const { authorization } = client.handshake.headers;

    // Log the received authorization header
    Logger.log({ authorization });

    // Extract the token part (removing 'Bearer ' prefix)
    const token: string = authorization.split(' ')[1];

    // Verify the JWT token using the provided secret key
    const payload = verify(token, 'secretKey');

    return payload; // Return the decoded payload
  }
}
