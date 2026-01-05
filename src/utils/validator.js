const XSDValidator = require('../validators/xsdValidator');
const SchemaManager = require('../validators/schemaManager');

class Validator {
    static validateXml(xmlContent) {
        if (!xmlContent || typeof xmlContent !== 'string') {
            throw new Error('Invalid XML content');
        }
        
        if (!/<[^>]+>/.test(xmlContent)) {
            throw new Error('Content does not appear to be valid XML');
        }
    }

    static validateXslt(xsltContent) {
        if (!xsltContent || typeof xsltContent !== 'string') {
            throw new Error('Invalid XSLT content');
        }

        if (!/<xsl:/.test(xsltContent)) {
            throw new Error('Content does not appear to be valid XSLT');
        }
    }

    /**
     * Валидирует XML против XSD схемы (если возможно)
     */
    static async validateWithXsd(xmlContent, xmlFilePath = null, xsdContent = null) {
        try {
            let schemaContent = xsdContent;
            let schemaSource = 'provided';
            
            // Если XSD не предоставлен, пытаемся найти автоматически
            if (!schemaContent) {
                schemaContent = await SchemaManager.resolveXsdSchema(xmlContent, xmlFilePath);
                schemaSource = 'resolved';
                
                // Если не нашли, пытаемся создать временную схему
                if (!schemaContent) {
                    schemaContent = SchemaManager.createTemporarySchema(xmlContent);
                    schemaSource = 'temporary';
                    if (schemaContent) {
                        console.log('Using temporary schema for basic validation');
                    }
                }
            }

            // Если нашли схему - валидируем
            if (schemaContent) {
                console.log(`Validating with ${schemaSource} schema...`);
                
                const validationResult = await XSDValidator.validate(xmlContent, schemaContent);
                
                if (!validationResult.isValid) {
                    const errorMessage = `XSD validation failed (${schemaSource} schema):\n${validationResult.errors.join('\n')}`;
                    
                    // Для временной схемы показываем предупреждение, а не ошибку
                    if (schemaSource === 'temporary') {
                        console.warn(`⚠ ${errorMessage}`);
                        console.warn('⚠ Consider providing a proper XSD schema for full validation');
                        return true; // Пропускаем ошибки временной схемы
                    }
                    
                    throw new Error(errorMessage);
                }
                
                console.log('✓ XSD validation passed successfully');
                return true;
            } else {
                console.log('ℹ XSD schema not found, skipping validation');
                return false;
            }

        } catch (error) {
            if (error.message.includes('XSD validation failed')) {
                throw error;
            }
            console.warn(`XSD validation warning: ${error.message}`);
            return false;
        }
    }
}

module.exports = Validator;