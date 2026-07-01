import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// MusicProvider persiste la sesión en localStorage — sin este reset, un test
// que guarde estado deja residuos que otros archivos de test pueden leer.
beforeEach(() => {
  window.localStorage.clear();
});
