import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

const objectIdPattern = /^[a-f\d]{24}$/i;
const focusByActivityType: Record<string, string> = { run: 'endurance', cycle: 'endurance', walk: 'endurance', strength: 'strength' };
const activityLabels: Record<string, string> = { run: 'corrida', cycle: 'ciclismo', walk: 'caminhada', strength: 'força' };
const focusLabels: Record<string, string> = { endurance: 'resistência', strength: 'força' };

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function asRecord(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
}

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : undefined;
}

function requireObjectId(value: unknown, field: string) {
  if (typeof value !== 'string' || !objectIdPattern.test(value)) {
    throw httpError(400, `${field} deve ser um identificador válido.`);
  }
  return value;
}

function toClientError(error: unknown, message: string) {
  return error instanceof mongoose.Error.ValidationError ? httpError(400, message) : error;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = asRecord(input);
  const userId = requireObjectId(body.userId, 'userId');
  const teamId = requireObjectId(body.teamId, 'teamId');
  const type = asText(body.type) ?? '';
  const minutes = Number(body.minutes);
  if (!type || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Informe tipo e minutos válidos para a atividade.');
  }

  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw httpError(404, 'Pessoa não encontrada.');
  if (!team) throw httpError(404, 'Equipe não encontrada.');

  try {
    // Pontos seguem os minutos registrados; a regra fica centralizada aqui.
    return await Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
  } catch (error) {
    throw toClientError(error, 'Dados inválidos para a atividade.');
  }
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = asRecord(input);
  const rawMembers = body.members ?? [];
  if (!Array.isArray(rawMembers)) throw httpError(400, 'members deve ser uma lista de identificadores.');
  const members = rawMembers.map((id) => requireObjectId(id, 'members'));

  try {
    return await Team.create({ name: asText(body.name), mascot: asText(body.mascot), members });
  } catch (error) {
    throw toClientError(error, 'Informe nome e mascote para a equipe.');
  }
}

export async function getLeaderboard() {
  const [teams, totals] = await Promise.all([
    Team.find().lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const pointsByTeam = new Map(totals.map((row) => [row._id.toString(), row.totalPoints]));

  return teams
    .map((team) => ({ teamName: team.name, totalPoints: pointsByTeam.get(team._id.toString()) ?? 0 }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw httpError(404, 'Pessoa não encontrada para este e-mail.');

  const latest = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const recentType = latest?.type;
  const recentFocus = recentType ? focusByActivityType[recentType] : undefined;
  const focus = recentFocus ?? user.fitnessGoal;
  const reason =
    recentType && recentFocus
      ? `Baseado na sua atividade recente de ${activityLabels[recentType]}.`
      : `Baseado na sua meta de ${focusLabels[focus] ?? focus}.`;

  const workouts = await Workout.find({ focus }).sort({ title: 1 }).lean();
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
