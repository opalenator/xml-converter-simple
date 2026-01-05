const fs = require('fs-extra');
const path = require('path');

class XSDValidator {
    /**
     * Простая валидация XML на основе базовых проверок
     * (Упрощенная реализация - для production используйте специализированные библиотеки)
     */
    static async validate(xmlContent, xsdContent) {
        const errors = [];
        
        try {
            // Базовая проверка обязательных элементов на основе XSD
            const xsdElements = this.parseXsdElements(xsdContent);
            
            for (const element of xsdElements) {
                const { name, required, type } = element;
                
                // Проверяем наличие обязательных элементов
                if (required && !this.elementExists(xmlContent, name)) {
                    errors.push(`Missing required element: ${name}`);
                }
                
                // Проверяем тип данных (упрощенно)
                if (type && this.elementExists(xmlContent, name)) {
                    const value = this.getElementValue(xmlContent, name);
                    if (!this.validateType(value, type)) {
                        errors.push(`Invalid type for element ${name}: expected ${type}, got ${value}`);
                    }
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
            
        } catch (error) {
            return {
                isValid: false,
                errors: [`Validation error: ${error.message}`]
            };
        }
    }
    
    static parseXsdElements(xsdContent) {
        const elements = [];
        const elementRegex = /<xs:element\s+name="([^"]+)"[^>]*\s+type="([^"]+)"[^>]*\s+minOccurs="0"/g;
        const requiredElementRegex = /<xs:element\s+name="([^"]+)"[^>]*\s+type="([^"]+)"[^>]*>/g;
        
        let match;
        while ((match = elementRegex.exec(xsdContent)) !== null) {
            elements.push({
                name: match[1],
                type: match[2],
                required: false
            });
        }
        
        while ((match = requiredElementRegex.exec(xsdContent)) !== null) {
            if (!elements.some(e => e.name === match[1])) {
                elements.push({
                    name: match[1],
                    type: match[2],
                    required: true
                });
            }
        }
        
        return elements;
    }
    
    static elementExists(xmlContent, elementName) {
        return new RegExp(`<${elementName}[^>]*>([^<]*)</${elementName}>`).test(xmlContent);
    }
    
    static getElementValue(xmlContent, elementName) {
        const regex = new RegExp(`<${elementName}[^>]*>([^<]*)</${elementName}>`);
        const match = xmlContent.match(regex);
        return match ? match[1].trim() : '';
    }
    
    static validateType(value, type) {
        switch (type) {
            case 'xs:integer':
                return /^\d+$/.test(value);
            case 'xs:string':
                return true; // Всегда валидно для строк
            case 'xs:decimal':
                return /^\d+(\.\d+)?$/.test(value);
            case 'xs:boolean':
                return /^(true|false|0|1)$/i.test(value);
            default:
                return true;
        }
    }
    
    static async validateFiles(xmlFilePath, xsdFilePath) {
        try {
            const [xmlContent, xsdContent] = await Promise.all([
                fs.readFile(xmlFilePath, 'utf8'),
                fs.readFile(xsdFilePath, 'utf8')
            ]);
            return await this.validate(xmlContent, xsdContent);
        } catch (error) {
            throw new Error(`XSD file validation error: ${error.message}`);
        }
    }
    
    static hasXsdReference(xmlContent) {
        return /xmlns:xsi=|schemaLocation|noNamespaceSchemaLocation/i.test(xmlContent);
    }
    
    static extractXsdPath(xmlContent) {
        const schemaLocationMatch = xmlContent.match(/schemaLocation\s*=\s*["']([^"']+)["']/i);
        const noNsSchemaMatch = xmlContent.match(/noNamespaceSchemaLocation\s*=\s*["']([^"']+)["']/i);
        return schemaLocationMatch?.[1] || noNsSchemaMatch?.[1] || null;
    }
}

module.exports = XSDValidator;