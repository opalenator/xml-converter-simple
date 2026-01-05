const fs = require('fs-extra');
const path = require('path');
const XSDValidator = require('./xsdValidator');

class SchemaManager {
    /**
     * Автоматически определяет и загружает XSD схему для XML
     */
    static async resolveXsdSchema(xmlContent, xmlFilePath = null) {
        try {
            // Проверяем, есть ли ссылка на XSD в XML
            if (XSDValidator.hasXsdReference(xmlContent)) {
                const xsdPath = XSDValidator.extractXsdPath(xmlContent);
                
                if (xsdPath) {
                    // Пытаемся разрешить путь к XSD
                    const resolvedPath = await this.resolveXsdFilePath(xsdPath, xmlFilePath);
                    
                    if (resolvedPath && await fs.pathExists(resolvedPath)) {
                        console.log(`Found XSD schema: ${resolvedPath}`);
                        return await fs.readFile(resolvedPath, 'utf8');
                    } else {
                        console.warn(`XSD schema not found at: ${xsdPath}`);
                        console.warn('Tried to resolve to:', resolvedPath);
                    }
                }
            }

            // Пытаемся найти схему по имени корневого элемента
            return await this.findSchemaByRootElement(xmlContent, xmlFilePath);
            
        } catch (error) {
            console.warn(`Не удалось разрешить XSD схему: ${error.message}`);
            return null;
        }
    }

    /**
     * Разрешает путь к XSD файлу
     */
    static async resolveXsdFilePath(xsdPath, xmlFilePath) {
        const possiblePaths = [];
        
        // Если путь абсолютный
        if (path.isAbsolute(xsdPath)) {
            possiblePaths.push(xsdPath);
        }

        // Если указан путь к XML файлу, ищем относительно его директории
        if (xmlFilePath) {
            const xmlDir = path.dirname(path.resolve(xmlFilePath));
            possiblePaths.push(
                path.join(xmlDir, xsdPath),
                path.join(xmlDir, path.basename(xsdPath))
            );
            
            // Пробуем найти в родительских директориях
            let currentDir = xmlDir;
            for (let i = 0; i < 3; i++) {
                currentDir = path.dirname(currentDir);
                possiblePaths.push(
                    path.join(currentDir, xsdPath),
                    path.join(currentDir, 'xsd', path.basename(xsdPath)),
                    path.join(currentDir, 'xsd', xsdPath)
                );
            }
        }

        // Пробуем найти в директории xsd/ проекта
        possiblePaths.push(
            path.join(process.cwd(), 'xsd', xsdPath),
            path.join(process.cwd(), 'xsd', path.basename(xsdPath)),
            path.join(process.cwd(), xsdPath)
        );

        // Пробуем найти в корне проекта
        possiblePaths.push(path.join(process.cwd(), path.basename(xsdPath)));

        // Проверяем все возможные пути
        for (const schemaPath of possiblePaths) {
            try {
                if (await fs.pathExists(schemaPath)) {
                    return schemaPath;
                }
            } catch (error) {
                // Пропускаем невалидные пути
                continue;
            }
        }

        return null;
    }

    /**
     * Ищет подходящую XSD схему по имени корневого элемента
     */
    static async findSchemaByRootElement(xmlContent, xmlFilePath = null) {
        try {
            const rootElementMatch = xmlContent.match(/<([^\s>]+)[^>]*>/);
            if (!rootElementMatch) return null;

            const rootElement = rootElementMatch[1];
            const possiblePaths = [
                path.join(process.cwd(), 'xsd', `${rootElement}.xsd`),
                path.join(process.cwd(), 'xsd', 'schema.xsd'),
                path.join(process.cwd(), 'xsd', 'default.xsd'),
                path.join(process.cwd(), 'xsd', 'example.xsd')
            ];

            if (xmlFilePath) {
                const xmlDir = path.dirname(xmlFilePath);
                possiblePaths.push(
                    path.join(xmlDir, `${rootElement}.xsd`),
                    path.join(xmlDir, 'schema.xsd'),
                    path.join(xmlDir, 'example.xsd'),
                    path.join(xmlDir, '../xsd', `${rootElement}.xsd`),
                    path.join(xmlDir, '../xsd', 'schema.xsd')
                );
            }

            for (const schemaPath of possiblePaths) {
                if (await fs.pathExists(schemaPath)) {
                    console.log(`Found schema by root element: ${schemaPath}`);
                    return await fs.readFile(schemaPath, 'utf8');
                }
            }

            console.warn(`No schema found for root element: ${rootElement}`);
            return null;
            
        } catch (error) {
            console.warn(`Поиск схемы по корневому элементу failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Создает временную XSD схему на лету для базовой валидации
     */
    static createTemporarySchema(xmlContent) {
        try {
            const rootElementMatch = xmlContent.match(/<([^\s>]+)[^>]*>/);
            if (!rootElementMatch) return null;

            const rootElement = rootElementMatch[1];
            
            // Простая схема для базовой валидации
            return `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
    <xs:element name="${rootElement}">
        <xs:complexType>
            <xs:sequence>
                <xs:any processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>`;
            
        } catch (error) {
            console.warn('Failed to create temporary schema:', error.message);
            return null;
        }
    }
}

module.exports = SchemaManager;