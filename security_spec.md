# Aoun Security Specification

## Data Invariants
1. A help request must have a valid category and status.
2. An offer must be linked to a valid help request.
3. Users can only edit their own profiles.
4. Only the author of a request can mark it as resolved or delete it.
5. Only the author of an offer can edit/delete it.
6. Recipients can only read their own notifications.

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a request with someone else's `authorUid`.
2. **Resource Poisoning**: Create a request with a 1MB title.
3. **Privilege Escalation**: A non-owner trying to mark a request as `resolved`.
4. **State Shortcutting**: Updating a `resolved` request back to `open` (if we decide to block this).
5. **PII Leak**: A non-owner reading a user's private info (if we had any).
6. **Orphaned Writes**: Creating an offer for a non-existent requestId.
7. **Shadow Update**: Adding a `verifiedVolunteer: true` field to a user profile.
8. **Invalid Category**: Creating a request with category `free_money`.
9. **Notification Snooping**: Reading another user's notifications.
10. **Timestamp Forgery**: Providing a manual `createdAt` in the past.
11. **Massive Array**: Creating a request with 1000 tags (if we had tags).
12. **Anonymous Override**: Changing an anonymous request back to public after creation.
