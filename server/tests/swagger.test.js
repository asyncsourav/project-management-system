import test from 'node:test';
import assert from 'node:assert/strict';
import { swaggerDocument } from '../config/swagger.js';

test('Swagger OpenAPI configuration structural validation', () => {
    assert.equal(swaggerDocument.openapi, '3.0.0');
    assert.ok(swaggerDocument.info.title);
    assert.ok(swaggerDocument.paths);

    // Required tags set by user request
    const expectedTags = [
        'Authentication',
        'Profile',
        'Refresh Token & Session Management',
        'Admin (User Management, Dashboard, Supervisor Assignment)',
        'Student (Proposal, Dashboard, File Upload, Supervisor Request)',
        'Teacher (Review Proposal, Assigned Students, Dashboard, Complete Project)',
        'Connections (Explore, Send Request, Accept/Reject, Block, Unblock)',
        'Chat (Messages, Reactions, Call History)'
    ];

    const actualTagNames = swaggerDocument.tags.map(t => t.name);
    for (const tag of expectedTags) {
        assert.ok(actualTagNames.includes(tag), `Missing expected tag: ${tag}`);
    }
});

test('Swagger paths registration completeness', () => {
    const requiredPaths = [
        '/auth/register',
        '/auth/login',
        '/auth/logout',
        '/auth/password/forgot',
        '/auth/password/reset/{token}',
        '/auth/password/change',
        '/auth/me',
        '/auth/profile/avatar',
        '/auth/refresh-token',
        '/auth/logout-all',
        '/admin/create-student',
        '/admin/update-student/{id}',
        '/admin/delete-student/{id}',
        '/admin/create-teacher',
        '/admin/update-teacher/{id}',
        '/admin/delete-teacher/{id}',
        '/admin/users/{id}/status',
        '/admin/getAllUsers',
        '/admin/projects',
        '/admin/projects/{projectId}/review',
        '/admin/assign-supervisor',
        '/admin/dashboard-stats',
        '/student/project',
        '/student/project-proposal',
        '/student/upload/{projectId}',
        '/student/fetch-supervisors',
        '/student/supervisor',
        '/student/pending-supervisor-request',
        '/student/supervisor-request',
        '/student/feedback/{projectId}',
        '/student/fetch-dashboard-stats',
        '/student/download/{projectId}/{fileId}',
        '/teacher/requests',
        '/teacher/requests/{requestId}/respond',
        '/teacher/students',
        '/teacher/students/{studentId}/drop',
        '/teacher/projects',
        '/teacher/projects/{projectId}/review',
        '/teacher/projects/{projectId}/complete',
        '/teacher/dashboard-stats',
        '/connections/explore',
        '/connections/my-connections',
        '/connections/request',
        '/connections/respond/{connectionId}',
        '/connections/pending',
        '/connections/history',
        '/connections/blocked',
        '/connections/unblock/{targetUserId}',
        '/connections/remove/{targetUserId}',
        '/connections/block-user/{targetUserId}',
        '/chat/friends',
        '/chat/send',
        '/chat/messages/{partnerId}',
        '/chat/clear-chat/{partnerId}',
        '/chat/messages/{messageId}/react',
        '/chat/call-history',
        '/chat/call-history/{historyId}'
    ];

    for (const pathKey of requiredPaths) {
        assert.ok(swaggerDocument.paths[pathKey], `Missing swagger documentation path: ${pathKey}`);
    }
});
