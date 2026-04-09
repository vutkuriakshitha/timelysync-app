# TimelySync Deployment

## Recommended Setup

- Backend: Render Web Service
- Frontend: Render Web Service
- Database: MongoDB Atlas

This project currently serves the frontend from `timelysyncc-frontend/server.js`, so deploying the frontend as a Node web service is the safest option.

## Files Added For Deploy

- `render.yaml`: Render service blueprint for frontend and backend

## Required Environment Variables

### Backend

- `MONGODB_URI`
- `JWT_SECRET`
- `TIMELYSYNC_CORS_ALLOWED_ORIGINS`

Optional if you want signup verification emails to work:

- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

### Frontend

- `API_BASE_URL`

Example:

- frontend `API_BASE_URL`: `https://your-backend-service.onrender.com/api`
- backend `TIMELYSYNC_CORS_ALLOWED_ORIGINS`: `https://your-frontend-service.onrender.com`

## Render Deploy Flow

1. Push this project to GitHub.
2. In Render, create services from `render.yaml`.
3. Set backend secrets:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `TIMELYSYNC_CORS_ALLOWED_ORIGINS`
4. After the backend gets its public URL, set the frontend `API_BASE_URL` to:
   - `https://your-backend-service.onrender.com/api`
5. Update backend `TIMELYSYNC_CORS_ALLOWED_ORIGINS` with the frontend URL:
   - `https://your-frontend-service.onrender.com`
6. Redeploy both services.

## Notes

- Backend port is now deploy-friendly and reads `PORT` automatically.
- Frontend API calls now support a deploy-time API base URL instead of requiring `localhost`.
- CORS is now configurable through `TIMELYSYNC_CORS_ALLOWED_ORIGINS`.
