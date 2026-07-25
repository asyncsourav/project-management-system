export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'EduNexus API',
        version: '1.0.0',
        description: 'Comprehensive REST API documentation for EduNexus: Academic Project & Collaboration Hub, supporting role-based access for Admin, Teacher, and Student roles, real-time chat, connection management, supervisor workflows, and session handling.',
        contact: {
            name: 'API Support',
            email: 'support@projectmanagementsystem.com'
        }
    },
    servers: [
        {
            url: '/api/v1',
            description: 'API v1 Base Endpoint'
        }
    ],
    tags: [
        {
            name: 'Authentication',
            description: 'User registration, authentication, login/logout, and password management'
        },
        {
            name: 'Profile',
            description: 'User profile management and avatar management'
        },
        {
            name: 'Refresh Token & Session Management',
            description: 'Token refresh and multi-device session revocation'
        },
        {
            name: 'Admin (User Management, Dashboard, Supervisor Assignment)',
            description: 'Administrator operations for managing users, assigned supervisors, project reviews, and system metrics'
        },
        {
            name: 'Student (Proposal, Dashboard, File Upload, Supervisor Request)',
            description: 'Student project submissions, file document uploads, supervisor requests, and dashboard stats'
        },
        {
            name: 'Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)',
            description: 'Teacher supervisor controls, proposal reviews, student management, and project completions'
        },
        {
            name: 'Connections (Explore, Send Request, Accept/Reject, Block, Unblock)',
            description: 'Social networking connections, user discovery, connection requests, and block listing'
        },
        {
            name: 'Chat (Messages, Reactions, Call History)',
            description: 'Direct messaging, media attachments, message reactions, and voice/video call history management'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT access token'
            },
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'accessToken',
                description: 'HTTP-only cookie containing JWT access token'
            }
        },
        schemas: {
            ApiResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Operation executed successfully' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error message description' },
                    errors: { type: 'array', items: { type: 'object' } }
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '60d5ec49f1b2c81128e45678' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    role: { type: 'string', enum: ['Student', 'Teacher', 'Admin'], example: 'Student' },
                    avatar: {
                        type: 'object',
                        properties: {
                            public_id: { type: 'string' },
                            url: { type: 'string', example: 'https://res.cloudinary.com/demo/image/upload/v1234/avatar.jpg' }
                        }
                    },
                    department: { type: 'string', example: 'Computer Science' },
                    isActive: { type: 'boolean', example: true },
                    year: { type: 'number', example: 4 },
                    rollNum: { type: 'string', example: 'CS2021001' },
                    employeeId: { type: 'string', example: 'EMP1002' },
                    designation: { type: 'string', example: 'Assistant Professor' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Project: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '60d5ec49f1b2c81128e45679' },
                    title: { type: 'string', example: 'AI Driven Task Allocator' },
                    description: { type: 'string', example: 'Project system using Machine Learning...' },
                    student: { type: 'string', example: '60d5ec49f1b2c81128e45678' },
                    supervisor: { type: 'string', example: '60d5ec49f1b2c81128e45680' },
                    status: { type: 'string', enum: ['Pending', 'Approved', 'Rejected', 'Completed'], example: 'Pending' },
                    technologies: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React', 'MongoDB'] },
                    files: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                fileName: { type: 'string' },
                                fileUrl: { type: 'string' },
                                uploadedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Connection: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '60d5ec49f1b2c81128e45681' },
                    requester: { type: 'string' },
                    recipient: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'accepted', 'rejected', 'blocked'] },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Message: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '60d5ec49f1b2c81128e45682' },
                    sender: { type: 'string' },
                    receiver: { type: 'string' },
                    message: { type: 'string', example: 'Hello, let us discuss the proposal.' },
                    mediaUrl: { type: 'string' },
                    mediaType: { type: 'string' },
                    reactions: { type: 'array', items: { type: 'object' } },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            CallHistory: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    caller: { type: 'string' },
                    receiver: { type: 'string' },
                    callType: { type: 'string', enum: ['audio', 'video'] },
                    status: { type: 'string', enum: ['missed', 'completed', 'rejected'] },
                    duration: { type: 'number', example: 120 },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    },
    security: [
        { bearerAuth: [] },
        { cookieAuth: [] }
    ],
    paths: {
        // ================= AUTHENTICATION =================
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new user account',
                description: 'Creates a new user profile (Student, Teacher, or Admin).',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password', 'role'],
                                properties: {
                                    name: { type: 'string', example: 'Jane Doe' },
                                    email: { type: 'string', example: 'jane@example.com' },
                                    password: { type: 'string', example: 'Secret123!' },
                                    role: { type: 'string', enum: ['Student', 'Teacher', 'Admin'], example: 'Student' },
                                    department: { type: 'string', example: 'Computer Science' },
                                    year: { type: 'number', example: 4 },
                                    rollNum: { type: 'string', example: 'CS2021002' },
                                    employeeId: { type: 'string', example: 'EMP1005' },
                                    designation: { type: 'string', example: 'Associate Professor' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'User registered successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
                    400: { description: 'Validation error or email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Log in to an existing account',
                description: 'Authenticates credentials and returns JWT access and refresh tokens.',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'jane@example.com' },
                                    password: { type: 'string', example: 'Secret123!' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } },
                    401: { description: 'Invalid credentials or inactive account', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Log out current session',
                description: 'Clears authentication cookies and invalidates refresh token.',
                responses: {
                    200: { description: 'Logged out successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } }
                }
            },
            get: {
                tags: ['Authentication'],
                summary: 'Log out current session (GET shortcut)',
                responses: {
                    200: { description: 'Logged out successfully' }
                }
            }
        },
        '/auth/password/forgot': {
            post: {
                tags: ['Authentication'],
                summary: 'Request password reset token',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: { email: { type: 'string', example: 'jane@example.com' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Password reset link sent to email' }
                }
            }
        },
        '/auth/password/reset/{token}': {
            put: {
                tags: ['Authentication'],
                summary: 'Reset password using token',
                security: [],
                parameters: [
                    { name: 'token', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['password', 'confirmPassword'],
                                properties: {
                                    password: { type: 'string', example: 'NewSecret123!' },
                                    confirmPassword: { type: 'string', example: 'NewSecret123!' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Password reset successful' }
                }
            }
        },
        '/auth/password/change': {
            put: {
                tags: ['Authentication'],
                summary: 'Change current user password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['oldPassword', 'newPassword'],
                                properties: {
                                    oldPassword: { type: 'string', example: 'Secret123!' },
                                    newPassword: { type: 'string', example: 'BrandNew123!' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Password changed successfully' }
                }
            }
        },

        // ================= PROFILE =================
        '/auth/me': {
            get: {
                tags: ['Profile'],
                summary: 'Get current user profile',
                description: 'Returns profile details for the authenticated user.',
                responses: {
                    200: {
                        description: 'User details fetched successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } }
                    }
                }
            }
        },
        '/auth/profile/avatar': {
            put: {
                tags: ['Profile'],
                summary: 'Update user profile avatar',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    avatar: { type: 'string', format: 'binary', description: 'Avatar image file' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Avatar updated successfully' }
                }
            }
        },

        // ================= REFRESH TOKEN & SESSION MANAGEMENT =================
        '/auth/refresh-token': {
            post: {
                tags: ['Refresh Token & Session Management'],
                summary: 'Refresh access token',
                description: 'Generates a new access token using valid refresh token cookie or request body.',
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { refreshToken: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Token refreshed successfully' },
                    401: { description: 'Invalid or expired refresh token' }
                }
            }
        },
        '/auth/logout-all': {
            post: {
                tags: ['Refresh Token & Session Management'],
                summary: 'Log out from all devices & sessions',
                description: 'Revokes all active refresh tokens associated with the user.',
                responses: {
                    200: { description: 'Successfully logged out from all devices' }
                }
            }
        },

        // ================= ADMIN =================
        '/admin/create-student': {
            post: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Create a student user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password', 'department', 'year', 'rollNum'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                    department: { type: 'string' },
                                    year: { type: 'number' },
                                    rollNum: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Student created successfully' } }
            }
        },
        '/admin/update-student/{id}': {
            put: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Update student details',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { 200: { description: 'Student updated successfully' } }
            }
        },
        '/admin/delete-student/{id}': {
            delete: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Delete student user',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Student deleted successfully' } }
            }
        },
        '/admin/create-teacher': {
            post: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Create a teacher user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password', 'department', 'employeeId'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    password: { type: 'string' },
                                    department: { type: 'string' },
                                    employeeId: { type: 'string' },
                                    designation: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Teacher created successfully' } }
            }
        },
        '/admin/update-teacher/{id}': {
            put: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Update teacher details',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
                responses: { 200: { description: 'Teacher updated successfully' } }
            }
        },
        '/admin/delete-teacher/{id}': {
            delete: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Delete teacher user',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Teacher deleted successfully' } }
            }
        },
        '/admin/users/{id}/status': {
            put: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Toggle user account status (Activate/Deactivate)',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { isActive: { type: 'boolean' } }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'User status updated successfully' } }
            }
        },
        '/admin/getAllUsers': {
            get: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Get all users list',
                parameters: [
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'role', in: 'query', schema: { type: 'string', enum: ['Student', 'Teacher', 'Admin'] } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
                ],
                responses: { 200: { description: 'User list retrieved successfully' } }
            }
        },
        '/admin/projects': {
            get: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: View all system projects',
                parameters: [
                    { name: 'status', in: 'query', schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Projects fetched successfully' } }
            }
        },
        '/admin/projects/{projectId}/review': {
            put: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Review project proposal',
                parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: { type: 'string', enum: ['Approved', 'Rejected'] },
                                    comments: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Proposal review submitted' } }
            }
        },
        '/admin/assign-supervisor': {
            post: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Assign teacher supervisor to project',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['projectId', 'teacherId'],
                                properties: {
                                    projectId: { type: 'string' },
                                    teacherId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Supervisor assigned successfully' } }
            }
        },
        '/admin/dashboard-stats': {
            get: {
                tags: ['Admin (User Management, Dashboard, Supervisor Assignment)'],
                summary: 'Admin: Fetch dashboard statistics',
                responses: { 200: { description: 'Admin statistics retrieved' } }
            }
        },

        // ================= STUDENT =================
        '/student/project': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Fetch active project details',
                responses: { 200: { description: 'Student project details' } }
            }
        },
        '/student/project-proposal': {
            post: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Submit project proposal',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'domain'],
                                properties: {
                                    title: { type: 'string', example: 'Smart Campus System' },
                                    description: { type: 'string', example: 'Comprehensive campus management platform...' },
                                    domain: { type: 'string', example: 'Web Development' },
                                    technologies: { type: 'array', items: { type: 'string' }, example: ['Node.js', 'React'] },
                                    preferredSupervisor: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Proposal submitted successfully' } }
            }
        },
        '/student/upload/{projectId}': {
            post: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Upload files for project',
                parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    files: { type: 'array', items: { type: 'string', format: 'binary' } }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Files uploaded successfully' } }
            }
        },
        '/student/fetch-supervisors': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Fetch list of available supervisors',
                responses: { 200: { description: 'List of supervisors' } }
            }
        },
        '/student/supervisor': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Get assigned supervisor info',
                responses: { 200: { description: 'Assigned supervisor info' } }
            }
        },
        '/student/pending-supervisor-request': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Get status of pending supervisor request',
                responses: { 200: { description: 'Pending supervisor request details' } }
            }
        },
        '/student/supervisor-request': {
            post: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Send request to teacher to become supervisor',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['teacherId'],
                                properties: {
                                    teacherId: { type: 'string' },
                                    message: { type: 'string', example: 'I would like to request your guidance for my project.' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Supervisor request sent' } }
            }
        },
        '/student/feedback/{projectId}': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Get proposal review feedback',
                parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Feedback details' } }
            }
        },
        '/student/fetch-dashboard-stats': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Fetch student dashboard statistics',
                responses: { 200: { description: 'Student dashboard statistics' } }
            }
        },
        '/student/download/{projectId}/{fileId}': {
            get: {
                tags: ['Student (Proposal, Dashboard, File Upload, Supervisor Request)'],
                summary: 'Student: Download uploaded project file asset',
                parameters: [
                    { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'fileId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'File binary stream' } }
            }
        },

        // ================= TEACHER =================
        '/teacher/requests': {
            get: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: View incoming student supervisor requests',
                responses: { 200: { description: 'List of supervisor requests' } }
            }
        },
        '/teacher/requests/{requestId}/respond': {
            post: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: Respond (Accept/Reject) to a supervisor request',
                parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['action'],
                                properties: {
                                    action: { type: 'string', enum: ['accept', 'reject'] },
                                    comment: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Request responded successfully' } }
            }
        },
        '/teacher/students': {
            get: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: View list of assigned students',
                responses: { 200: { description: 'List of assigned students' } }
            }
        },
        '/teacher/students/{studentId}/drop': {
            put: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: Drop supervision of a student',
                parameters: [{ name: 'studentId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Student supervision dropped' } }
            }
        },
        '/teacher/projects': {
            get: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: View supervised projects',
                responses: { 200: { description: 'List of supervised projects' } }
            }
        },
        '/teacher/projects/{projectId}/review': {
            put: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: Review project proposal',
                parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: { type: 'string', enum: ['Approved', 'Rejected', 'Changes Requested'] },
                                    feedback: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Review recorded successfully' } }
            }
        },
        '/teacher/projects/{projectId}/complete': {
            put: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: Mark project as completed',
                parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: false,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    grade: { type: 'string', example: 'A+' },
                                    remarks: { type: 'string', example: 'Excellent work throughout.' }
                                }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Project marked as completed' } }
            }
        },
        '/teacher/dashboard-stats': {
            get: {
                tags: ['Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)'],
                summary: 'Teacher: Get supervisor dashboard metrics',
                responses: { 200: { description: 'Teacher dashboard statistics' } }
            }
        },

        // ================= CONNECTIONS =================
        '/connections/explore': {
            get: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Explore users to connect with',
                parameters: [
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'role', in: 'query', schema: { type: 'string' } },
                    { name: 'department', in: 'query', schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Users found' } }
            }
        },
        '/connections/my-connections': {
            get: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Get current user connection friends list',
                responses: { 200: { description: 'List of accepted connections' } }
            }
        },
        '/connections/request': {
            post: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Send a connection request to a user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['receiverId'],
                                properties: {
                                    receiverId: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Connection request sent' } }
            }
        },
        '/connections/respond/{connectionId}': {
            put: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Accept or reject an incoming connection request',
                parameters: [{ name: 'connectionId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['action'],
                                properties: { action: { type: 'string', enum: ['accept', 'reject'] } }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Request responded successfully' } }
            }
        },
        '/connections/pending': {
            get: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Get pending incoming and outgoing connection requests',
                responses: { 200: { description: 'Pending connection requests' } }
            }
        },
        '/connections/history': {
            get: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Get connection interaction history log',
                responses: { 200: { description: 'Connection history' } }
            }
        },
        '/connections/blocked': {
            get: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Get list of blocked users',
                responses: { 200: { description: 'Blocked user list' } }
            }
        },
        '/connections/unblock/{targetUserId}': {
            put: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Unblock a user',
                parameters: [{ name: 'targetUserId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'User unblocked successfully' } }
            }
        },
        '/connections/remove/{targetUserId}': {
            delete: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Remove an existing connection',
                parameters: [{ name: 'targetUserId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Connection removed' } }
            }
        },
        '/connections/block-user/{targetUserId}': {
            put: {
                tags: ['Connections (Explore, Send Request, Accept/Reject, Block, Unblock)'],
                summary: 'Block a user directly',
                parameters: [{ name: 'targetUserId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'User blocked successfully' } }
            }
        },

        // ================= CHAT =================
        '/chat/friends': {
            get: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Get connected friends available for direct chat',
                responses: { 200: { description: 'Chat friends list' } }
            }
        },
        '/chat/send': {
            post: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Send a chat message',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['receiverId'],
                                properties: {
                                    receiverId: { type: 'string' },
                                    content: { type: 'string', example: 'Hello!' },
                                    mediaUrl: { type: 'string' },
                                    mediaType: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Message sent successfully' } }
            }
        },
        '/chat/messages/{partnerId}': {
            get: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Get message conversation history with partner',
                parameters: [
                    { name: 'partnerId', in: 'path', required: true, schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } }
                ],
                responses: { 200: { description: 'Conversation messages' } }
            }
        },
        '/chat/clear-chat/{partnerId}': {
            delete: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Clear chat conversation history with partner',
                parameters: [{ name: 'partnerId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Chat cleared successfully' } }
            }
        },
        '/chat/messages/{messageId}/react': {
            post: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Add or remove an emoji reaction on a message',
                parameters: [{ name: 'messageId', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['emoji'],
                                properties: { emoji: { type: 'string', example: '👍' } }
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Reaction updated' } }
            }
        },
        '/chat/call-history': {
            get: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Get voice and video call history records',
                responses: { 200: { description: 'Call history list' } },
                delete: {
                    tags: ['Chat (Messages, Reactions, Call History)'],
                    summary: 'Clear all call history logs',
                    responses: { 200: { description: 'Call history cleared' } }
                }
            }
        },
        '/chat/call-history/{historyId}': {
            delete: {
                tags: ['Chat (Messages, Reactions, Call History)'],
                summary: 'Delete a single call history record',
                parameters: [{ name: 'historyId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Call record deleted' } }
            }
        }
    }
};

export const swaggerUiOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'EduNexus - API Documentation'
};
