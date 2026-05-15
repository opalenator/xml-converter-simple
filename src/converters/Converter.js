const fs = require('fs-extra');
const path = require('path');
const ggeBimToJSON = require('./ggeBimToJSON');
const GrandToJSON = require('./GrandToJSON');
const SmetaRuToJSON = require('./SmetaRuToJSON');

const unicodeToWin1251= require('../utils/unicodeToWin1251');
const iconv = require('iconv-lite');
class Converter {
    /**
     * Конвертирует файлы используя xslt4node
     */
    static async convertFile(xmlPath, outputPath, options = {}) {
        try {
            console.log('📁 XML путь:', xmlPath);
            console.log('📁 Output путь:', outputPath);
            // Проверяем существование файлов
            if (!(await fs.pathExists(xmlPath))) {
                throw new Error(`XML файл не существует: ${xmlPath}`);
            }
            
            // Создаем выходную директорию
            await fs.ensureDir(path.dirname(outputPath));
            
            console.log('🔄 Начинаем преобразование...');
            // Чтение файлов
            const [xmlContent] = await Promise.all([
                fs.readFile(xmlPath),
            ]);
            var DOMParser = require('xmldom').DOMParser;
            var parser = new DOMParser();
            var text=iconv.decode(xmlContent, 'win1251')
            var xml=parser.parseFromString(text)
            var value= (text.includes("LocalEstimateBaseIndexMethod"))? 
                JSON.stringify(ggeBimToJSON(xml,path.parse(xmlPath).name), 'utf-8')
                :text.includes("{2B0470FD-477C-4359-9F34-EEBE36B7D340}")?
                JSON.stringify(GrandToJSON(xml,path.parse(xmlPath).name), 'utf-8')
                :((text.includes(`Generator="Smeta.RU"`))&&(text.includes(`DocumentType="Объект"`)))?
                JSON.stringify(SmetaRuToJSON(xml,path.parse(xmlPath).name), 'utf-8')
                :null
            if (!value) throw  "Not LS"

            const win1251Array = unicodeToWin1251(value);
            // Преобразуем Uint8Array в буфер
            const buffer = Buffer.from(value);
            await Promise.all([
                fs.writeFile(outputPath, buffer),
            ]);
            console.log('✅ Преобразование завершено');
            
        } catch (error) {
            if (error=="Not LS") console.error('Формат файла не поддерживается!');
            else console.error('❌ Ошибка в convertFile:', error.message);
            throw new Error(`File conversion error: ${error}`);
        }
    }

}

module.exports = Converter;