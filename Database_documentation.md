# Database documentation

## Superbase Overview

The AI Student Assistant uses Superbase as its backend database platform. Superbase provides a PostgreSQL database, user authentication, file storage and security policies. It is used to manage users, uploaded study materials and data related to the AI chatbot.

## Superbase Services Used

| Superbase service | Purpose |
|---|---|
| PostgreSQL Database | Stores application data |
| Supabase Auth | Registers and authenticates users |
| Superbase Storage | Stores uploaded PDFs, images and documents |
| Row-Level Security | Controls which users can access data |
| Superbase API | Allows the frontend and backend to access data |

---

# 3. Database Tables

## 1. Materials Table

The materials table stores information about study materials uploaded by users. The actual files are stored in Superbase Storage, while this table stores the file details and storage location.

- (pk) = primary key
- (fk) = foreign key

| Column name | Data type | Description |
|---|---|---|
| Id (pk) | UUID | Unique identifier for each uploaded material. |
| user_id (fk) | UUID | Identifies the user who uploaded the material. |
| module_id (fk) | UUID | Identifies the module to which the material belongs. |
| file_name | TEXT | Stores the original name of the uploaded file. |
| file_type | TEXT | Stores the file format, such as PDF, PNG, JPG or DOCX. |
| storage_path | TEXT | Stores the location of the file inside the Superbase Storage bucket. |
| file_size | INT8 | Stores the size of the uploaded file in bytes. |
| created_at | TIMESTAMPTZ | Stores the date and time when the material was uploaded. |

### Relationships

- materials.id → users.id
- materials.module_id → module.id

---

## 2. Modules Table

The modules table stores information about the academic modules available in the application. Each module can be assigned to a teacher.

| Column name | Data type | Description |
|---|---|---|
| Id (pk) | UUID | Unique identifier for each module. |
| name | TEXT | Stores the complete name of the module. |
| code | TEXT | Stores the module code . |
| teacher_id (fk) | UUID | Identifies the teacher responsible for the module. |
| description | TEXT | Stores a description of the module and its content. |
| created_at | TIMESTAMP | Stores the date and time when the module was created. |

### Relationships

- module.teacher_id → users.id
- One module can have multiple materials.

---

## 3. Chats Table

The chats table stores the conversation history between users and the AI chatbot. Each record represents one message sent either by a user or by the AI assistant.

| Column name | Data type | Description |
|---|---|---|
| Id (pk) | UUID | Unique identifier for each chat message. |
| user_id (fk) | UUID | Identifies the user who owns the conversation. |
| module_id (fk) | UUID | Identifies the module related to the conversation. |
| role | TEXT | Identifies who sent the message, such as user or assistant. |
| content | TEXT | Stores the actual message or AI-generated response. |
| created_at | TIMESTAMP | Stores the date and time when the message was created. |

### Relationships

- Chats.user_id → users.id
- Chats.module_id → module.id
- Multiple messages can belong to the same user and module.

---

## 4. Profile Table

The profile table stores additional academic information about each user. It extends the basic user information stored in the users table.

| Column name | Data type | Description |
|---|---|---|
| Id (pk) (fk) | UUID | Unique identifier for the profile record. |
| Role (fk) | VARCHAR | Stores the role of the user, such as student or teacher. |
| semester | VARCHAR | Stores the semester in which the student is currently enrolled. |
| module_study | VARCHAR | Stores information about the module or modules studied by the student. |
| modules_teach | VARCHAR | Stores information about the module or modules taught by the teacher. |
| user_id | UUID | Connects the profile to the corresponding user account. |

### Relationships

- Profile.id →users.id
- Profile.role → role.name
- Each user should normally have one profile record.

---

## 5. Users Table

The users table stores the basic information of users registered in the AI Student Assistant application.

| Column name | Data type | Description |
|---|---|---|
| Id (pk) | UUID | Unique identifier for each user. |
| Name | VARCHAR | Stores the full name of the user. |
| Role (fk) | VARCHAR | Stores the assigned role of the user. |
| email | VARCHAR | Stores the email address of the user. |
| date_created | DATE | Stores the date when the user account was created. |

### Relationships

- id is referenced by tables such as profile, materials, modules and chats.
- Users.role → role.name
- One user can upload multiple materials.
- One user can have multiple chat messages.
- A teacher can be connected to multiple modules.

---

## 6. Role Table

The role table stores the different types of users available in the application and the permissions assigned to each role.

| Column name | Data type | Description |
|---|---|---|
| Name (pk) | VARCHAR | Stores the name of the role, such as student, teacher or administrator. |
| description | TEXT | Describes the purpose and responsibilities of the role. |
| permissions | TEXT | Stores the permissions or actions that the role is allowed to perform. |

### Relationships

- name is used by the role column in the users table.
- name may also be used by the role column in the profile table.
- One role can be assigned to multiple users.

---

# 1.5 Superbase Storage

The application uses a Superbase Storage bucket named materials to store files uploaded by users. These files may include lecture notes, PDF documents, images and other learning materials used in the AI Student Assistant.

The actual files are stored inside the Storage bucket, while information about each file is stored separately in the materials database table. The database table stores details such as the file name, file type, file size, storage path, uploader and related module.

## Storage Bucket Configuration

| Setting | Configuration |
|---|---|
| Bucket name | materials |
| Purpose | Stores uploaded academic materials |
| Storage policies | 3 policies configured |
| File-size limit | Not manually configured; Superbase currently displays a 50 MB limit |
| Allowed MIME types | Any file type |
| Related database table | materials |

---

# Row-Level Security and Storage Policies

The project uses Row-Level Security (RLS) to protect database records and files stored in Supabase. Only authenticated users are allowed to perform permitted operations. Two separate groups of policies are used:

1. Policies for records in the materials database table
2. Policies for files in the materials Storage bucket

---

## 1. Materials Table Policies

RLS is enabled on the materials database table. The table contains information about uploaded files, such as the user ID, module ID, file name, file type, storage path and file size.

Three policies are configured:

| Policy name | Command | Applied to | Purpose |
|---|---|---|---|
| Users can add their own materials | INSERT | Authenticated users | Allows a logged-in user to create a database record for their own uploaded material. |
| Users can delete their own materials | DELETE | Authenticated users | Allows a logged-in user to delete a material record that belongs to them. |
| Users can view their own materials | SELECT | Authenticated users | Allows a logged-in user to view material records that belong to them. |

### Explanation

- The INSERT policy allows authenticated users to add metadata about an uploaded file to the materials table.
- The SELECT policy allows users to retrieve and display their own uploaded materials.
- The DELETE policy allows users to remove their own material records from the database.
- These policies help prevent one user from accessing or deleting another user’s material records.

---

## 2. Materials Storage Bucket Policies

The application also uses a Supabase Storage bucket named materials. This bucket stores the actual uploaded files, while the materials database table stores information about those files.

Three Storage policies are configured:

| Policy name | Command | Applied to | Purpose |
|---|---|---|---|
| Users can upload their own files | INSERT | Authenticated users | Allows logged-in users to upload files to the materials bucket. |
| Users can view their own files | SELECT | Authenticated users | Allows logged-in users to access or download their own uploaded files. |
| Users can delete their own files | DELETE | Authenticated users | Allows logged-in users to delete their own files from the Storage bucket. |

### Explanation

- The INSERT Storage policy controls file uploads.
- The SELECT Storage policy controls access to stored files.
- The DELETE Storage policy controls file deletion.
- Superbase applies Storage policies to its internal storage. Objects table because this table manages information about every file stored in Superbase Storage.
