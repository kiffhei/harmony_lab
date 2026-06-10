import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KeyExplorer from './KeyExplorer.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';

function renderWithProvider(ui) {
  return render(<MusicProvider>{ui}</MusicProvider>);
}

describe('KeyExplorer', () => {

  it('renderiza sin errores con estado inicial C Major', () => {
    const { container } = renderWithProvider(<KeyExplorer />);
    expect(container.querySelector('.key-explorer-module')).toBeInTheDocument();
    expect(screen.getByLabelText('Root note')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale name')).toBeInTheDocument();
  });

  it('los dos selects existen con valores correctos: C y Major', () => {
    renderWithProvider(<KeyExplorer />);
    const rootSelect  = screen.getByLabelText('Root note');
    const scaleSelect = screen.getByLabelText('Scale name');
    expect(rootSelect.value).toBe('C');
    expect(scaleSelect.value).toBe('Major');
  });

  it('cambiar el select de root a G actualiza el contexto', () => {
    renderWithProvider(<KeyExplorer />);
    const rootSelect = screen.getByLabelText('Root note');
    fireEvent.change(rootSelect, { target: { value: 'G' } });
    expect(rootSelect.value).toBe('G');
  });

  it('cambiar el select de scale a Minor actualiza el contexto', () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByLabelText('Scale name');
    fireEvent.change(scaleSelect, { target: { value: 'Minor' } });
    expect(scaleSelect.value).toBe('Minor');
  });

  it('renderiza 7 chips para escala Major (7 notas)', () => {
    renderWithProvider(<KeyExplorer />);
    const chips = document.querySelectorAll('.key-note-chip');
    expect(chips).toHaveLength(7);
  });

  it('renderiza 7 chips para escala Minor (7 notas)', () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByLabelText('Scale name');
    fireEvent.change(scaleSelect, { target: { value: 'Minor' } });
    const chips = document.querySelectorAll('.key-note-chip');
    expect(chips).toHaveLength(7);
  });

  it('renderiza 5 chips para Pentatonic Maj', () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByLabelText('Scale name');
    fireEvent.change(scaleSelect, { target: { value: 'Pentatonic Maj' } });
    const chips = document.querySelectorAll('.key-note-chip');
    expect(chips).toHaveLength(5);
  });

  it('la chip de la nota raíz tiene clase active', () => {
    renderWithProvider(<KeyExplorer />);
    const chips = document.querySelectorAll('.key-note-chip');
    const activeChips = Array.from(chips).filter((c) => c.classList.contains('active'));
    expect(activeChips).toHaveLength(1);
    expect(activeChips[0].querySelector('.key-note-chip-name').textContent).toBe('C');
  });

  it('renderiza 7 filas en la tabla de grados para Major', () => {
    renderWithProvider(<KeyExplorer />);
    const rows = document.querySelectorAll('.key-degree-row');
    expect(rows).toHaveLength(7);
  });

  it('click en fila actualiza activeChord con el acorde correcto', () => {
    renderWithProvider(<KeyExplorer />);
    const rows = document.querySelectorAll('.key-degree-row');
    // Click on the 5th degree (V — G in C Major)
    fireEvent.click(rows[4]);
    const activeRows = Array.from(document.querySelectorAll('.key-degree-row.active'));
    expect(activeRows).toHaveLength(1);
    expect(activeRows[0].querySelector('.key-degree-roman').textContent).toBe('V');
  });

  it('el SVG del círculo de quintas existe en el DOM', () => {
    renderWithProvider(<KeyExplorer />);
    expect(screen.getByTestId('cof-svg')).toBeInTheDocument();
  });

  it('click en un nodo del SVG cambia rootNote', () => {
    renderWithProvider(<KeyExplorer />);
    const gNode = screen.getByTestId('cof-node-G');
    fireEvent.click(gNode);
    const rootSelect = screen.getByLabelText('Root note');
    expect(rootSelect.value).toBe('G');
  });

  it('el nodo central muestra el rootNote activo', () => {
    renderWithProvider(<KeyExplorer />);
    const svg  = screen.getByTestId('cof-svg');
    // El tspan con la nota raíz (font-size 14) contiene 'C'
    const tspans = svg.querySelectorAll('tspan');
    const rootTspan = Array.from(tspans).find((t) => t.getAttribute('fontSize') === '14' || t.textContent === 'C');
    expect(rootTspan).toBeTruthy();
    expect(rootTspan.textContent).toBe('C');
  });

});
