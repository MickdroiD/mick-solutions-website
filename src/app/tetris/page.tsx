import type { Metadata } from 'next';
import TetrisGame from '@/components/TetrisGame';

export const metadata: Metadata = {
  title: 'Tetris Rose',
  description: 'Un jeu de Tetris fonctionnel aux couleurs roses.',
};

export default function TetrisPage() {
  return <TetrisGame />;
}
