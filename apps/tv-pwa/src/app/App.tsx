import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import { init } from '@noriginmedia/norigin-spatial-navigation-core';
import { router } from './router/router';

// Инициализация должна быть вызвана один раз при старте приложения
init({
  debug: false,
  visualDebug: false,
});

export const App = () => {
  return (
    <MantineProvider defaultColorScheme="dark">
      <RouterProvider router={router} />
    </MantineProvider>
  );
};