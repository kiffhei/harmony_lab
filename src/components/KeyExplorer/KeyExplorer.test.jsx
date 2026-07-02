import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KeyExplorer, { SCALE_MOOD } from './KeyExplorer.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';
import { useMusicContext } from '../../hooks/useMusicContext.js';
import { getScaleNames } from '../../core/MusicTheory.js';

const mockPlayTone  = vi.fn();
const mockPlayChord = vi.fn();

vi.mock('../../hooks/useAudioEngine.js', () => ({
  useAudioEngine: () => ({
    playTone:  mockPlayTone,
    playChord: mockPlayChord,
    getEngine: vi.fn(),
  }),
}));

beforeEach(() => vi.clearAllMocks());

let contextRef;

function ContextProbe() {
  contextRef = useMusicContext();
  return null;
}

function renderWithProvider(ui) {
  contextRef = null;
  return render(<MusicProvider>{ui}<ContextProbe /></MusicProvider>);
}

describe('KeyExplorer', () => {

  it('renderiza sin errores con estado inicial C Major', () => {
    const { container } = renderWithProvider(<KeyExplorer />);
    expect(container.querySelector('.key-explorer-module')).toBeInTheDocument();
    expect(screen.getByLabelText('Root note')).toBeInTheDocument();
    expect(screen.getByLabelText('Scale')).toBeInTheDocument();
  });

  it('los dos selects existen con valores correctos: C y Major', () => {
    renderWithProvider(<KeyExplorer />);
    const rootSelect  = screen.getByLabelText('Root note');
    const scaleSelect = screen.getByLabelText('Scale');
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
    const scaleSelect = screen.getByLabelText('Scale');
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
    const scaleSelect = screen.getByLabelText('Scale');
    fireEvent.change(scaleSelect, { target: { value: 'Minor' } });
    const chips = document.querySelectorAll('.key-note-chip');
    expect(chips).toHaveLength(7);
  });

  it('renderiza 5 chips para Pentatonic Maj', () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByLabelText('Scale');
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

  it('el botón "+ Agregar a progresión" solo aparece en la fila activa', () => {
    renderWithProvider(<KeyExplorer />);
    expect(screen.queryByLabelText(/Agregar .* a la progresión/)).not.toBeInTheDocument();
    const rows = document.querySelectorAll('.key-degree-row');
    fireEvent.click(rows[4]); // V
    expect(screen.getByLabelText(/Agregar .* a la progresión/)).toBeInTheDocument();
  });

  it('click en "+ Agregar a progresión" agrega el acorde activo a la progresión', () => {
    renderWithProvider(<KeyExplorer />);
    const rows = document.querySelectorAll('.key-degree-row');
    fireEvent.click(rows[4]); // V — G en C Major
    fireEvent.click(screen.getByLabelText(/Agregar .* a la progresión/));
    expect(contextRef.progression).toHaveLength(1);
    expect(contextRef.progression[0].roman).toBe('V');
    expect(contextRef.progression[0].beats).toBe(4);
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

  it('click en un nodo del SVG reproduce el tono de esa nota', () => {
    renderWithProvider(<KeyExplorer />);
    fireEvent.click(screen.getByTestId('cof-node-G'));
    expect(mockPlayTone).toHaveBeenCalledTimes(1);
  });

  it('cambiar el select de root reproduce el tono de la nueva tónica', () => {
    renderWithProvider(<KeyExplorer />);
    fireEvent.change(screen.getByLabelText('Root note'), { target: { value: 'G' } });
    expect(mockPlayTone).toHaveBeenCalledTimes(1);
  });

  it('cambiar el select de scale reproduce el acorde tónico de la nueva escala', () => {
    renderWithProvider(<KeyExplorer />);
    fireEvent.change(screen.getByLabelText('Scale'), { target: { value: 'Minor' } });
    expect(mockPlayChord).toHaveBeenCalledTimes(1);
  });

  it('click en una fila de grado reproduce el acorde de ese grado', () => {
    renderWithProvider(<KeyExplorer />);
    const rows = document.querySelectorAll('.key-degree-row');
    fireEvent.click(rows[4]); // V
    expect(mockPlayChord).toHaveBeenCalledTimes(1);
  });

  it('click en una chip de nota reproduce el tono de esa tónica', () => {
    renderWithProvider(<KeyExplorer />);
    const chips = document.querySelectorAll('.key-note-chip');
    fireEvent.click(chips[1]);
    expect(mockPlayTone).toHaveBeenCalledTimes(1);
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

  it('MoodBanner se renderiza con la escala activa', () => {
    renderWithProvider(<KeyExplorer />);
    expect(screen.getByText('Alegría · Confianza')).toBeInTheDocument();
  });

  it('MoodBanner cambia al cambiar la escala', async () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByRole('combobox', { name: /scale/i });
    await userEvent.selectOptions(scaleSelect, 'Dorian');
    expect(screen.getByText('Serenidad · Groove')).toBeInTheDocument();
  });

  it('Double Harmonic muestra nota aclaratoria de Glass Beams', async () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByRole('combobox', { name: /scale/i });
    await userEvent.selectOptions(scaleSelect, 'Double Harmonic');
    // "Glass Beams" aparece en .key-mood-note y en .key-mood-refs
    expect(screen.getAllByText(/Glass Beams/).length).toBeGreaterThan(0);
  });

  it('Phrygian Dominant muestra nota aclaratoria de King Gizzard', async () => {
    renderWithProvider(<KeyExplorer />);
    const scaleSelect = screen.getByRole('combobox', { name: /scale/i });
    await userEvent.selectOptions(scaleSelect, 'Phrygian Dominant');
    // "King Gizzard" aparece en .key-mood-note y en .key-mood-refs
    expect(screen.getAllByText(/King Gizzard/).length).toBeGreaterThan(0);
  });

  it('las 12 escalas tienen entrada en SCALE_MOOD', () => {
    const scales = getScaleNames();
    scales.forEach((scale) => {
      expect(SCALE_MOOD[scale]).toBeDefined();
    });
  });

});
