import { setProjectAnnotations } from '@storybook/react-vite';
import { beforeAll } from 'vitest';
import * as previewAnnotations from './preview';

const annotations = setProjectAnnotations([previewAnnotations.default]);

beforeAll(annotations.beforeAll);
