# Contract: @unbranded-ds/react Public API

**Package**: `@unbranded-ds/react`  
**Date**: 2026-04-10

---

## Component Exports

All components are named exports from the package root:

```typescript
import { Button, Input, Label, Card, Dialog, Select, Checkbox, Switch, Tabs } from '@unbranded-ds/react';
```

---

## Common Props

Every component accepts:

- `className?: string` — Merged with internal classes via `cn()` (clsx + tailwind-merge). Consumer classes override internal classes when conflicts arise.
- `ref` — Forwarded to the root DOM element via `React.forwardRef`.
- All valid HTML attributes for the underlying element (spread via `...props`).

---

## Component Contracts

### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}
```

**Primitive**: `<button>` (plain HTML)  
**Stories**: Default, all variants, all sizes, Disabled, Loading, WithIcon, play: click interaction

### Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}
```

**Primitive**: `<input>` (plain HTML)  
**Stories**: Default, Disabled, WithPlaceholder, WithLabel, File, play: type interaction

### Label

```typescript
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}
```

**Primitive**: `<label>` (plain HTML)  
**Stories**: Default, WithInput, Required

### Card

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}
// Sub-components: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
```

**Primitive**: `<div>` (plain HTML)  
**Stories**: Default, WithHeader, WithFooter, FullExample

### Dialog

```typescript
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
// Sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
```

**Primitive**: `@base-ui-components/react` Dialog  
**Stories**: Default, Controlled, WithForm, Nested, play: open/close interaction

### Select

```typescript
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
}
// Sub-components: SelectTrigger, SelectContent, SelectItem, SelectValue
```

**Primitive**: `@base-ui-components/react` Select  
**Stories**: Default, WithPlaceholder, Disabled, ManyOptions, play: select interaction

### Checkbox

```typescript
interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean | 'indeterminate') => void;
  disabled?: boolean;
  className?: string;
}
```

**Primitive**: `@base-ui-components/react` Checkbox  
**Stories**: Default, Checked, Indeterminate, Disabled, WithLabel, play: toggle interaction

### Switch

```typescript
interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}
```

**Primitive**: `@base-ui-components/react` Switch  
**Stories**: Default, Checked, Disabled, WithLabel, play: toggle interaction

### Tabs

```typescript
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}
// Sub-components: TabsList, TabsTrigger, TabsContent
```

**Primitive**: `@base-ui-components/react` Tabs  
**Stories**: Default, Controlled, ManyTabs, Disabled, play: tab switch interaction

---

## Utility Export

### `cn(...inputs: ClassValue[]): string`

Class name merge utility (clsx + tailwind-merge). Exported for consumer use.

```typescript
import { cn } from '@unbranded-ds/react';
```

---

## Peer Dependencies

- `react` >= 18
- `react-dom` >= 18
- `@base-ui-components/react`

## Dependencies

- `@unbranded-ds/tokens`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
