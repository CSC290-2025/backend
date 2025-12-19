# Smart City Hub (Backend)

Backend application for the Smart City Hub project.

## Prerequisites

Make sure you have the following installed:

- **Node.js** (LTS recommended)
- **pnpm**: 10.17.1 (via Corepack)

## Setup Instructions

1. **Clone the repository**

   ```sh
   git clone https://github.com/CSC290-2025/backend.git
   cd backend
   ```

2. **Enable Corepack**

   Corepack ensures consistent package manager versions across environments.

   ```sh
   corepack enable
   ```

3. **Install dependencies**

   ```sh
   pnpm install
   ```

4. **Generate Prisma client**

   ```sh
   pnpx prisma@6.16.0 generate
   ```

5. **Generate Prisma client**

   ```sh
   pnpx prisma@6.16.0 generate
   ```

6. **Configure service account for Firebase**

   Generate a Firebase service account key (JSON format) and Save the file in the project root directory and name it `serviceAccount.json`

7. **Run the development server**
   ```sh
   pnpm run dev
   ```

## Academic Context

This project is developed for CSC290: Integrated Project I,
Bachelor of Science in Computer Science,
School of Information Technology,
King Mongkut's University of Technology Thonburi (KMUTT),
Academic Year 2025.

## License

This project is for academic use only and is not intended for commercial distribution.
