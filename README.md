# Campus Connect (61)

Build a modern, production-ready full-stack web application called "Campus Lost & Found Portal" using the MERN stack.

Tech Stack:

- Frontend: React.js (Vite)

- Styling: Tailwind CSS

- Backend: Node.js + Express.js

- Database: MongoDB Atlas

- Authentication: JWT + bcrypt

- Image Storage: Cloudinary

- Real-time Chat: Socket.io

- QR Code Generation: qrcode package

- QR Code Scanner: html5-qrcode

- Email Notifications: Nodemailer

- HTTP Client: Axios

Project Objective:

The application should help students report lost and found items inside a college campus. Students can post lost items, post found items, chat with each other, and securely claim belongings.

Design Requirements:

- Clean modern UI

- Responsive for mobile, tablet, and desktop

- Minimalistic design

- Blue and white color theme

- Smooth animations

- Professional dashboard

- Loading skeletons

- Toast notifications

- Dark mode support

Authentication:

- Student Registration

- Student Login

- JWT Authentication

- Password hashing with bcrypt

- Protected Routes

- User Profile

- Logout

Database Collections:

Users

- _id

- name

- email

- studentId

- password

- profileImage

- department

- year

- createdAt

LostItems

- _id

- title

- description

- category

- brand

- color

- locationLost

- dateLost

- images

- ownerId

- qrCode

- status

- createdAt

FoundItems

- _id

- title

- description

- category

- brand

- color

- locationFound

- dateFound

- images

- finderId

- status

- createdAt

Chats

- senderId

- receiverId

- messages

- timestamps

Claims

- itemId

- claimerId

- status

- proof

- timestamps

Notifications

- userId

- message

- type

- isRead

- createdAt

Main Pages:

- Landing Page

- Login

- Register

- Dashboard

- Report Lost Item

- Report Found Item

- Lost Items Listing

- Found Items Listing

- Item Details

- Chat Page

- Notifications

- My Posts

- My Claims

- Profile

- Admin Dashboard

Dashboard Features:

- Number of Lost Items

- Number of Found Items

- Successfully Returned Items

- Recent Activity

- Latest Notifications

- Quick Actions

Core Features:

1. Report Lost Item

- Upload multiple images

- Select category

- Add location

- Add description

- Date picker

2. Report Found Item

- Upload images

- Found location

- Description

- Contact option

3. Smart Matching

Automatically compare lost and found items using:

- Category

- Brand

- Color

- Keywords from description

Generate possible matches and notify both users.

4. QR Code

Generate a unique QR code for every item.

Users can download the QR code.

When scanned, it should open the item's public page where someone can report that they found it.

5. Real-Time Chat

Use Socket.io.

Students can securely chat only after a claim request or successful match.

6. Notifications

Notify users when:

- A possible match is found

- Someone sends a claim request

- Someone sends a message

- Item status changes

7. Claim Process

Allow claim requests.

Finder can review the request and approve or reject it.

After approval, mark the item as Returned.

8. Search & Filters

Search by:

- Item Name

- Category

- Brand

- Location

- Date

- Status

9. Admin Panel

- View all users

- View all items

- Delete fake reports

- Ban users

- Analytics Dashboard

- Manage claims

REST API Structure:

/api/auth

/api/users

/api/lost-items

/api/found-items

/api/chat

/api/claims

/api/notifications

/api/admin

Folder Structure:

client/

  src/

    components/

    pages/

    hooks/

    context/

    services/

    utils/

    assets/

server/

  controllers/

  routes/

  middleware/

  models/

  config/

  services/

  sockets/

  utils/

Security:

- JWT Authentication

- Password Encryption

- Input Validation

- Rate Limiting

- Helmet

- CORS

- Secure API Design

Deployment:

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

Generate clean, modular, scalable code using best practices. Use reusable React components, RESTful APIs, proper error handling, loading states, and responsive layouts. Structure the project so it is easy to extend with future features such as AI-based image matching or mobile app support.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://home-bound-campus.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c3b5d3ab-a6fc-4317-9945-ad38086083d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
