import {
    ExerciseType,
    ExerciseTypeId,
    CreateExerciseTypeInput,
    UpdateExerciseTypeInput,
} from '../../types/workout/exerciseType';
import { ExerciseTypeRepository } from './types';

interface ExerciseTypeStorageData {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export class LocalStorageExerciseTypeRepository implements ExerciseTypeRepository {
    private readonly STORAGE_KEY = 'gym-tracker:exercise-types';

    private loadAll(): Map<ExerciseTypeId, ExerciseType> {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (!json) {
                return new Map();
            }

            const data: Record<string, ExerciseTypeStorageData> = JSON.parse(json);
            const map = new Map<ExerciseTypeId, ExerciseType>();

            for (const [id, item] of Object.entries(data)) {
                map.set(id, this.deserialize(item));
            }

            return map;
        } catch (error) {
            console.error('Failed to load exercise types from localStorage:', error);
            return new Map();
        }
    }

    private saveAll(items: Map<ExerciseTypeId, ExerciseType>): void {
        try {
            const data: Record<string, ExerciseTypeStorageData> = {};

            for (const [id, item] of items.entries()) {
                data[id] = this.serialize(item);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save exercise types to localStorage:', error);
            throw new Error('Failed to save exercise types to localStorage');
        }
    }

    private serialize(entity: ExerciseType): ExerciseTypeStorageData {
        return {
            id: entity.id,
            name: entity.name,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString(),
        };
    }

    private deserialize(data: ExerciseTypeStorageData): ExerciseType {
        return {
            id: data.id,
            name: data.name,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            deletedAt: data.deletedAt ? new Date(data.deletedAt) : undefined,
        };
    }

    async findById(id: ExerciseTypeId): Promise<ExerciseType | null> {
        const items = this.loadAll();
        const item = items.get(id);

        if (!item || item.deletedAt) {
            return null;
        }

        return item;
    }

    async findAll(): Promise<ExerciseType[]> {
        const items = this.loadAll();
        const result: ExerciseType[] = [];

        for (const item of items.values()) {
            if (!item.deletedAt) {
                result.push(item);
            }
        }

        // Sort by createdAt descending (newest first)
        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async create(input: CreateExerciseTypeInput): Promise<ExerciseType> {
        const items = this.loadAll();
        const now = new Date();

        const newItem: ExerciseType = {
            id: crypto.randomUUID(),
            name: input.name,
            createdAt: now,
            updatedAt: now,
        };

        items.set(newItem.id, newItem);
        this.saveAll(items);

        return newItem;
    }

    async update(
        id: ExerciseTypeId,
        input: UpdateExerciseTypeInput
    ): Promise<ExerciseType | null> {
        const items = this.loadAll();
        const existing = items.get(id);

        if (!existing || existing.deletedAt) {
            return null;
        }

        const updated: ExerciseType = {
            ...existing,
            name: input.name !== undefined ? input.name : existing.name,
            updatedAt: new Date(),
        };

        items.set(id, updated);
        this.saveAll(items);

        return updated;
    }

    async delete(id: ExerciseTypeId): Promise<boolean> {
        const items = this.loadAll();
        const existing = items.get(id);

        if (!existing || existing.deletedAt) {
            return false;
        }

        const updated: ExerciseType = {
            ...existing,
            deletedAt: new Date(),
            updatedAt: new Date(),
        };

        items.set(id, updated);
        this.saveAll(items);

        return true;
    }
}