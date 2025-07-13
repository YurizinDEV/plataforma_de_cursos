import mongoose from 'mongoose';
import getGlobalFakeMapping from '../../seeds/globalFakeMapping.js';

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function isRefField(key, mongooseSchema) {
    const path = mongooseSchema.path(key);
    return !!(
        path &&
        path.instance === 'Array' &&
        path.caster &&
        path.caster.options &&
        path.caster.options.ref
    );
}

export async function generateExample(schema, key = null, mongooseSchema = null) {
    if (schema.example !== undefined) {
        return schema.example;
    }

    const mapping = await getGlobalFakeMapping();

    if (key && mapping[key]) {
        const generator = mapping[key];
        return typeof generator === 'function' ? generator() : generator;
    }

    if (key === '_id') {
        return new mongoose.Types.ObjectId().toString();
    }

    switch (schema.type) {
        case 'string':
            if (schema.format === 'email') return 'exemplo@email.com';
            if (schema.format === 'date-time') return new Date().toISOString();
            if (key && key.toLowerCase().includes('password')) return 'senha123';
            return 'string de exemplo';

        case 'number':
        case 'integer':
            return schema.minimum ? schema.minimum : 1;

        case 'boolean':
            return true;

        case 'array':
            const itemExample = await generateExample(schema.items, null, mongooseSchema);
            return [itemExample];

        case 'object':
            if (schema.properties) {
                const result = {};
                for (const [propKey, propSchema] of Object.entries(schema.properties)) {
                    result[propKey] = await generateExample(propSchema, propKey, mongooseSchema);
                }
                return result;
            }
            return {};

        default:
            return null;
    }
}
