# Virel React Development

Conventions for Laravel 12 + Inertia.js + React + TypeScript frontend

## Architecture

### Atomic Design

Component organization:

- `atoms/` - Button, Input, Badge, TextInput, Toggle, Spinner
- `molecules/` - TextField, SelectField, FormField, AlertBanner
- `organisms/` - Forms, tables, modals
- `templates/` - Page layouts (AuthLayout)

Location: `resources/js/src/components/{level}/`

### Domain-Driven

Business logic by domain:

- `services/` - API calls in `*.service.ts`
- `types/` - TypeScript interfaces in `*.types.ts`
- `stores/` - Zustand state in `resources/js/store/*.store.ts`

Location: `resources/js/domains/{domain}/`

Examples: auth, projects, deployments, environment, settings, users

## Imports

Alias `@` → `resources/js/`

```tsx
import { Button } from '@/src/components/atoms/button';
import { environmentService } from '@/domains/environment/environment.service';
```

## Styling

- TailwindCSS
- Custom tokens with `virel-*` prefix for dark theme
- Use `virel-*` tokens in dark-themed components

### virel-\* Tokens

```
virel-base        #0f1117
virel-surface    #161922
virel-elevated   #1c1f2e
virel-border     #1e2230
virel-text       #e4e5e9
virel-textSecondary #8b8d98
```

## Components

### Atoms

**Button** (`resources/js/src/components/atoms/button.tsx`)

```tsx
<Button variant="default" size="default">
  Label
</Button>
```

- variant: default | outline | secondary | ghost | destructive | link
- size: default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg

**TextInput** (`resources/js/src/components/atoms/text-input.tsx`)

- Props: name, value, onChange, type, placeholder, disabled, required

### Molecules

**TextField** (`resources/js/src/components/molecules/text-field.tsx`)

```tsx
<TextField label="Label" name="field" value={val} onChange={handler} error="error" hint="hint" />
```

**SelectField** - Select wrapper with label/error

**FormField** - Base field wrapper

**AlertBanner** - Notification (error/success/info/warning)

### Organisms

- Forms: CreateProjectForm, ProfileForm
- Tables: ProjectsTable, UsersTable
- Modals: InviteUserModal

## State Management

**Zustand** - `resources/js/store/{domain}.store.ts`

```ts
interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login: async (credentials) => { ... }
}))
```

## API Services

`resources/js/domains/{domain}/{domain}.service.ts`

```ts
export const environmentService = {
  async getVariables(projectId: string) {
    const response = await fetch(`/home/projects/${projectId}/env`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },
};
```

## Types

`resources/js/domains/{domain}/{domain}.types.ts`

```ts
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  environment: 'development' | 'staging' | 'production';
  created_at: string;
}
```

## Forms

- Controlled components with useState
- Inline validation with error state
- Pattern: prevent default → set loading → try/catch → navigate.reload()

## Routing

**Inertia.js** - `resources/js/pages/{route}/index.tsx`

```tsx
const { project, variables } = usePage().props as unknown as PagePropsType;

EnvPage.layout = (page) => <HomeLayout>{page}</HomeLayout>;
```

- `usePage()` - Get page props
- `useNavigate()` - Navigation
- `navigate.reload()` - Refresh page data
- `sonner` - toast.success() / toast.error()

## Data Passing

- From Laravel: `Inertia::render()->with('prop', $data)`
- To Laravel: Form submission to controller

## Reference Files

| Component   | File                                                      |
| ----------- | --------------------------------------------------------- |
| Button      | `resources/js/src/components/atoms/button.tsx`            |
| TextField   | `resources/js/src/components/molecules/text-field.tsx`    |
| TextInput   | `resources/js/src/components/atoms/text-input.tsx`        |
| Auth Store  | `resources/js/store/auth.store.ts`                        |
| Env Service | `resources/js/domains/environment/environment.service.ts` |
| Env Page    | `resources/js/pages/home/projects/env/index.tsx`          |
| Tailwind    | `tailwind.config.js`                                      |
| Vite        | `vite.config.ts`                                          |

## Common Tasks

### Create Atom

```tsx
// resources/js/src/components/atoms/{Name}.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

interface Props { ... }

function Component({ ... }: Props) {
  return <div className={cn(...)}>...</div>
}

export { Component }
```

### Create Molecule

```tsx
// resources/js/src/components/molecules/{Name}.tsx
import { Component } from '@/src/components/atoms/component';

interface Props extends Omit<ComponentProps, 'className'> {
  label: string;
}

function Molecule({ label, ...props }: Props) {
  return <Component {...props} />;
}

export { Molecule };
```

### Create Service

```ts
// resources/js/domains/{domain}/{domain}.service.ts
export const service = {
  async method(id: string) {
    const response = await fetch(`/url/${id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
};
```

### Create Page

```tsx
// resources/js/pages/{route}/index.tsx
import * as React from 'react';
import { usePage, useNavigate } from '@inertiajs/react';
import { toast } from 'sonner';
import { component } from '@/src/components/...';

interface PageProps {
  data: Type;
}

const Page: React.FC = () => {
  const { data } = usePage().props as unknown as PageProps;
  const navigate = useNavigate();
  // ...
};

Page.layout = (page) => <Layout>{page}</Layout>;
export default Page;
```
