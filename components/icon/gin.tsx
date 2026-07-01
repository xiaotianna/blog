import GinIcon from '@iconify-react/logos/gin';
import { ComponentProps } from 'react';

export const Gin = (props: ComponentProps<typeof GinIcon>) => (
  <GinIcon className='size-4' {...props} />
);
