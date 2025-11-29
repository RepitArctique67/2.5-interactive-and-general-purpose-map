const { DataTypes } = require('sequelize');
const Layer = require('../../../src/models/Layer');

// Since we can't easily spin up a DB in this environment without changing config,
// we will test the model definition.

describe('Layer Model', () => {
    it('should have correct name', () => {
        expect(Layer.name).toBe('Layer');
    });

    it('should have correct attributes', () => {
        const attributes = Layer.rawAttributes;

        expect(attributes.name).toBeDefined();
        expect(attributes.name.type.key).toBe('STRING');
        expect(attributes.name.allowNull).toBe(false);

        expect(attributes.type).toBeDefined();
        expect(attributes.type.type.key).toBe('STRING');

        expect(attributes.isActive).toBeDefined();
        expect(attributes.isActive.defaultValue).toBe(true);

        expect(attributes.opacity).toBeDefined();
        expect(attributes.opacity.defaultValue).toBe(1.0);
    });

    it('should have validation on opacity', () => {
        const attributes = Layer.rawAttributes;
        expect(attributes.opacity.validate).toBeDefined();
        expect(attributes.opacity.validate.min).toBe(0);
        expect(attributes.opacity.validate.max).toBe(1);
    });
});
