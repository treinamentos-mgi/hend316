import { useJsonResource } from '../api/useJsonResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

const typeLabels: Record<string, string> = { run: 'Corrida', cycle: 'Ciclismo', walk: 'Caminhada', strength: 'Força' };

export default function Activities() {
  const { status, data } = useJsonResource<{ activities: Activity[] }>('/api/activities');
  const activities = data?.activities ?? [];

  return (
    <CapabilityCard
      title="Atividades"
      description="Acompanhe os minutos de atividade e os pontos das pessoas participantes."
      status={status}
      isEmpty={activities.length === 0}
      emptyMessage="Sem atividades registradas ainda."
    >
      <table className="table">
        <thead>
          <tr><th scope="col">Tipo</th><th scope="col">Minutos</th><th scope="col">Pontos</th></tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr key={index}><td>{typeLabels[activity.type] ?? activity.type}</td><td>{activity.minutes}</td><td>{activity.points}</td></tr>
          ))}
        </tbody>
      </table>
    </CapabilityCard>
  );
}
