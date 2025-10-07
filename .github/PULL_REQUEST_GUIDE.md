# Pull Request Guide

## How to Use the PR Template

### 1. Summary

Provide a clear, concise description of what your PR does and why it's needed. This should be 1-3 sentences that explain the purpose and impact of your changes.

**Example:**

```text
This PR adds a new user authentication component that integrates with our existing auth system. It improves the login experience by adding form validation and loading states.
```

### 2. Type of Change

Check the appropriate box(es) that describe your change:

- **Bug fix**: Fixes an existing issue without breaking changes
- **New feature**: Adds new functionality without breaking existing features
- **Documentation**: Updates to docs, README, or code comments
- **Refactoring**: Code restructuring without changing functionality
- **Performance**: Changes that improve performance
- **Tests**: Adding or updating tests

### 3. Changes Made

List the main changes using bullet points. Be specific about what was modified, added, or removed.

**Example:**

```text
- Added UserAuthForm component with email/password validation
- Implemented loading spinner for login process
- Updated AuthContext to handle form submission states
- Added error handling for invalid credentials
```

### 4. Testing Checklist

Complete all applicable items before requesting review:

- **Local testing**: Verify changes work in development environment
- **Build verification**: Ensure `pnpm run build` succeeds
- **Type-checking**: Verify `pnpm run type-check` passes
- **Linting**: Verify `pnpm run check` passes
- **Responsive testing**: Test UI changes on different screen sizes (if applicable)

### 5. Dependencies

Link related issues or PRs:

- `Depends on: #123` - This PR cannot be merged until #123 is merged
- `Blocked by: #456` - Cannot proceed until #456 is resolved
- `Related to: #789` - Connected but not dependent

## Markdown Syntax Guide

### Basic Formatting

```markdown
**Bold text**
_Italic text_
~~Strikethrough~~
`inline code`
```

### Lists

```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another numbered item
```

### Checkboxes

```markdown
- [x] Completed task
- [ ] Incomplete task
```

### Links and References

```markdown
[Link text](https://example.com)
#123 (references issue/PR #123)
@username (mentions a user)
```

### Code Blocks

````markdown
```javascript
function example() {
  return 'syntax highlighted code';
}
```
````

### Images

```markdown
![Alt text](image-url)
```

### Collapsible Sections

````markdown
<details>
  <summary>Click me</summary>
  
  ### Heading
  1. Foo
  2. Bar
     * Baz
     * Qux

### Some Javascript

```js
function logSomething(something) {
  console.log('Something', something);
}
```

</details>
````

Follow this [gist](https://gist.github.com/pierrejoubert73/902cc94d79424356a8d20be2b382e1ab) for more 'details'. (heh)

## Best Practices

### Writing Good PR Descriptions

- Be clear and concise
- Include context for reviewers

### Before Submitting

1. Self-review your code changes
2. Test thoroughly in different scenarios
3. Update documentation if needed
4. Request review from appropriate team members

### Merge Conflicts

- Pull latest changes from main branch
- Resolve conflicts locally
- Test after resolving conflicts
- Push updated branch
