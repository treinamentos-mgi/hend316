import { useJsonResource } from '../api/useJsonResource.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

// Pessoa de demonstração até existir seleção de usuário.
const demoUserEmail = 'mona@example.com';

export default function Workouts() {
  const { status, data } = useJsonResource<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(demoUserEmail)}`);
  const suggestions = data?.suggestions ?? [];

  return (
    <CapabilityCard
      title="Sugestões de treino"
      description="Receba recomendações de treino com base nos seus padrões de atividade."
      status={status}
      isEmpty={suggestions.length === 0}
      emptyMessage="Nenhuma sugestão disponível para esta pessoa."
    >
      <ul className="list-unstyled">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="mb-3"><strong>{suggestion.title}</strong><br />{suggestion.reason}</li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
