# API Development Checklist

Use this checklist when adding new API endpoints to ensure you follow the correct flow and don't miss any steps.

## Pre-Development

- [ ] **Understand the requirement** - What does the API need to do?
- [ ] **Check if endpoint already exists** - Avoid duplication
- [ ] **Plan the data flow** - Request → Validation → Business Logic → Database → Response
- [ ] **Identify database changes needed** - New tables, columns, relationships?
- [ ] **Setup test data** - Create test users if needed for testing APIs

### Test User Creation (optional)

If your API endpoints require user authentication or user-related operations, you can create test users in your database:

```sql
-- Example test user for development/testing
INSERT INTO users (username, email, phone, password_hash)
VALUES ('testuser', 'test@example.com', '1234567890', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- You can create multiple test users with different data as needed
INSERT INTO users (username, email, phone, password_hash)
VALUES ('developer', 'dev@example.com', '0987654321', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');
```

_Note: The password hash above corresponds to 'secret123' - adjust as needed for your testing requirements._

---

## Development Checklist

### 1. SCHEMAS (`schemas/wallet.schemas.ts`)

- [ ] **Request schema** - Define input validation with Zod
- [ ] **Response schema** - Define output structure
- [ ] **Parameter schema** - Define URL parameters (if needed)
- [ ] **OpenAPI route** - Create route definition with `createGetRoute/createPostRoute/createPutRoute`
- [ ] **Export schemas** - Add to `WalletSchemas` object
- [ ] **Verify imports** - Check Zod and helper imports

### 2. TYPES (`types/wallet.types.ts`)

- [ ] **Import schemas** - Import from schemas file
- [ ] **Create types** - Use `z.infer<typeof Schema>`
- [ ] **Export types** - Add to exports list
- [ ] **Check naming** - Follow consistent naming conventions

### 3. MODELS (`models/wallet.model.ts`)

- [ ] **Import types** - Import required types
- [ ] **Database function** - Create Prisma operation
- [ ] **Error handling** - Use `handlePrismaError`
- [ ] **Data conversion** - Use converter functions for consistency
- [ ] **Export function** - Add to exports list
- [ ] **Test database function** - Verify Prisma query works

### 4. SERVICES (`services/wallet.service.ts`)

- [ ] **Import dependencies** - Types, models, error classes
- [ ] **Business logic** - Implement validation and rules
- [ ] **Error handling** - Use appropriate error types (`NotFoundError`, `ValidationError`)
- [ ] **Call model functions** - Use model layer for database operations
- [ ] **Return proper types** - Match expected return types
- [ ] **Export function** - Add to exports list

### 5. CONTROLLERS (`controllers/wallet.controller.ts`)

- [ ] **Import services** - Import service functions
- [ ] **Parse request** - Extract parameters, body, query
- [ ] **Call service** - Pass data to service layer
- [ ] **Format response** - Use `successResponse` helper
- [ ] **Handle async** - Use async/await properly
- [ ] **Export function** - Add to exports list

### 6. ROUTES (`routes/wallet.openapi.routes.ts`)

- [ ] **Import dependencies** - Schemas and controllers
- [ ] **Register route** - Add `app.openapi()` call in `setupWalletRoutes`
- [ ] **Match schema to controller** - Ensure schema and controller function match
- [ ] **Test route binding** - Verify no TypeScript errors

---

## Testing Checklist

### Manual Testing

- [ ] **Successful requests** - Test happy path scenarios
- [ ] **Error scenarios** - Test validation errors, not found, etc.
- [ ] **Edge cases** - Test boundary conditions
- [ ] **Response format** - Verify response matches schema

### Automated Testing

- [ ] **Unit tests** - Test models and services independently
- [ ] **Integration tests** - Test controller + service + model together
- [ ] **API tests** - Test full HTTP endpoint

---

## Code Quality Checklist

### TypeScript

- [ ] **No `any` types** - Use proper typing throughout
- [ ] **No TypeScript errors** - Run `npm run build` successfully
- [ ] **Consistent imports** - Use proper import/export patterns

### Error Handling

- [ ] **Proper error types** - Use `NotFoundError`, `ValidationError`, etc.
- [ ] **Error messages** - Clear, user-friendly messages
- [ ] **Error propagation** - Let errors bubble up properly

### Code Style

- [ ] **Consistent naming** - Follow camelCase for functions, PascalCase for types
- [ ] **Function size** - Keep functions focused and small
- [ ] **Comments** - Add comments for complex business logic
- [ ] **No console.logs** - Remove debug statements

---

## Documentation Checklist

- [ ] **API documentation** - OpenAPI generates this automatically
- [ ] **Code comments** - Document complex logic
- [ ] **Type documentation** - Use JSDoc for complex types if needed
- [ ] **README updates** - Update module README if adding major features

---

## Common Mistakes to Avoid

### AVOID

- **Skip layers** - Don't call models directly from controllers
- **Mix responsibilities** - Don't put business logic in controllers
- **Ignore errors** - Don't use empty catch blocks
- **Hard code values** - Use constants or environment variables
- **Forget validation** - Always validate input data
- **Use `any` types** - Maintain type safety

### FOLLOW

- **Follow the layer order** - Schemas → Types → Models → Services → Controllers → Routes
- **Handle errors properly** - Use appropriate error types and messages
- **Keep functions focused** - Single responsibility principle
- **Use TypeScript** - Leverage type safety throughout
- **Test thoroughly** - Both happy path and error scenarios
- **Follow conventions** - Maintain consistency with existing code

---

## Final Verification

Before marking complete:

- [ ] **Code builds** - `npm run build` passes
- [ ] **No lint errors** - Code follows style guidelines
- [ ] **Endpoint works** - Manual testing confirms functionality
- [ ] **Documentation updated** - OpenAPI docs show new endpoint
- [ ] **Tests pass** - All automated tests succeed
- [ ] **Error handling works** - Error scenarios handled gracefully

---

## Need Help?

- **Review existing code** - Look at other endpoints for patterns
- **Check architecture docs** - Refer to `ARCHITECTURE_DIAGRAM.md`
- **See example** - Check `EXAMPLE_NEW_API.md` for complete walkthrough
- **Ask team members** - When in doubt, ask for code review
