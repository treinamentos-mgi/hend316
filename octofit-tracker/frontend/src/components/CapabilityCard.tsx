import type { ReactNode } from 'react';
import type { ResourceStatus } from '../api/useJsonResource.js';

type Props = {
  title: string;
  description: string;
  status: ResourceStatus;
  isEmpty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
};

export function CapabilityCard({ title, description, status, isEmpty = false, emptyMessage = '', children }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {status === 'loading' && <p role="status">Carregando…</p>}
        {status === 'error' && <div role="alert" className="alert alert-danger">Não foi possível carregar os dados. Tente novamente em instantes.</div>}
        {status === 'ready' && (isEmpty ? <p className="text-muted">{emptyMessage}</p> : children)}
      </div>
    </section>
  );
}
