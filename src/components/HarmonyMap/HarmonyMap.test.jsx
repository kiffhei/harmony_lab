import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HarmonyMap from './HarmonyMap.jsx';
import { MusicProvider } from '../../context/MusicContext.jsx';
import { useMusicContext } from '../../hooks/useMusicContext.js';

// Evita AudioContext en jsdom
vi.mock('../../hooks/useAudioEngine.js', () => ({
  useAudioEngine: () => ({
    playChord: vi.fn(),
    playTone:  vi.fn(),
    getEngine: vi.fn(),
  }),
}));

function renderWithProvider(ui) {
  return render(<MusicProvider>{ui}</MusicProvider>);
}

describe('HarmonyMap', () => {

  it('renderiza sin errores con estado inicial (C Major)', () => {
    const { container } = renderWithProvider(<HarmonyMap />);
    expect(container.querySelector('.harmony-module')).toBeInTheDocument();
  });

  it('renderiza 7 nodos de acordes para escala Major', () => {
    renderWithProvider(<HarmonyMap />);
    const nodes = document.querySelectorAll('[data-testid^="chord-node-"]');
    expect(nodes).toHaveLength(7);
  });

  it('el nodo I (tónica) tiene clase tonic', () => {
    renderWithProvider(<HarmonyMap />);
    const wrapper = screen.getByTestId('chord-node-I');
    expect(wrapper.querySelector('.chord-node.tonic')).toBeInTheDocument();
  });

  it('click en un nodo actualiza activeChord en contexto', () => {
    renderWithProvider(<HarmonyMap />);
    const nodeI = screen.getByTestId('chord-node-I');
    fireEvent.click(nodeI.querySelector('.chord-node'));
    expect(document.querySelector('.harmony-chord-info')).toBeInTheDocument();
  });

  it('panel de info NO visible cuando activeChord es null', () => {
    renderWithProvider(<HarmonyMap />);
    expect(document.querySelector('.harmony-chord-info')).not.toBeInTheDocument();
  });

  it('panel de info VISIBLE tras click en un nodo', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    expect(document.querySelector('.harmony-chord-info')).toBeInTheDocument();
  });

  it('panel muestra el nombre del acorde activo', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    const display = document.querySelector('.harmony-chord-name-display');
    expect(display).toBeInTheDocument();
    expect(display.textContent).toContain('C');
  });

  it('botón + Agregar agrega el acorde a progression', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    fireEvent.click(screen.getByText(/\+ Agregar/));
    expect(document.querySelector('.harmony-prog-chord')).toBeInTheDocument();
  });

  it('la barra de progresión muestra el acorde agregado', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    fireEvent.click(screen.getByText(/\+ Agregar/));
    const progChords = document.querySelectorAll('.harmony-prog-chord');
    expect(progChords.length).toBeGreaterThan(0);
  });

  it('botón ✕ limpia la progresión', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    fireEvent.click(screen.getByText(/\+ Agregar/));
    expect(document.querySelector('.harmony-prog-chord')).toBeInTheDocument();
    fireEvent.click(screen.getByText('✕'));
    expect(document.querySelector('.harmony-prog-chord')).not.toBeInTheDocument();
    expect(document.querySelector('.harmony-prog-empty')).toBeInTheDocument();
  });

  it('SVG de aristas existe en el DOM', () => {
    renderWithProvider(<HarmonyMap />);
    expect(screen.getByTestId('harmony-edges')).toBeInTheDocument();
  });

  it('renderiza nodos para Phrygian Dominant (6 o 7 nodos)', () => {
    function ScaleWrapper() {
      const { setScaleName } = useMusicContext();
      return (
        <>
          <button onClick={() => setScaleName('Phrygian Dominant')}>set-scale</button>
          <HarmonyMap />
        </>
      );
    }
    renderWithProvider(<ScaleWrapper />);
    fireEvent.click(screen.getByText('set-scale'));
    const nodes = document.querySelectorAll('[data-testid^="chord-node-"]');
    expect(nodes.length).toBeGreaterThanOrEqual(6);
    expect(nodes.length).toBeLessThanOrEqual(7);
  });

  it('panel de sugerencias visible tras click en nodo', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    expect(document.querySelector('.harmony-suggestions')).toBeInTheDocument();
  });

  it('las sugerencias muestran el label de relación', () => {
    renderWithProvider(<HarmonyMap />);
    fireEvent.click(screen.getByTestId('chord-node-I').querySelector('.chord-node'));
    const labels = document.querySelectorAll('.suggestion-relation');
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0].textContent).toMatch(/→/);
  });

  it('click en sugerencia cambia activeChord', () => {
    renderWithProvider(<HarmonyMap />);
    // Activar el nodo V (dominante) para tener sugerencias de resolución
    fireEvent.click(screen.getByTestId('chord-node-V').querySelector('.chord-node'));
    const chips = document.querySelectorAll('.harmony-suggestion-chip');
    expect(chips.length).toBeGreaterThan(0);
    // Click en la primera sugerencia
    fireEvent.click(chips[0]);
    // El panel de info sigue visible (activeChord actualizado)
    expect(document.querySelector('.harmony-chord-info')).toBeInTheDocument();
  });

  it('commonProgressions se renderizan como botones', () => {
    renderWithProvider(<HarmonyMap />);
    const presets = document.querySelectorAll('.harmony-prog-preset');
    expect(presets.length).toBeGreaterThan(0);
  });

  it('click en progresión preset carga los acordes en progression', () => {
    renderWithProvider(<HarmonyMap />);
    const presets = document.querySelectorAll('.harmony-prog-preset');
    fireEvent.click(presets[0]);
    const progChords = document.querySelectorAll('.harmony-prog-chord');
    expect(progChords.length).toBeGreaterThan(0);
  });

});
