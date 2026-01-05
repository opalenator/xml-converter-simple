#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const Converter = require('./src/converters/Converter');
const FileHandler = require('./src/utils/fileHandler');

const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 -x[xml] -o [output]')
    .option('xml', {
        alias: 'x',
        describe: 'Путь к XML файлу',
        type: 'string',
        demandOption: true
    })

    .option('output', {
        alias: 'o',
        describe: 'Путь для выходного JSON файла',
        type: 'string',
        default: './output/output.json'
    })
    .option('verbose', {
        alias: 'v',
        describe: 'Подробный вывод',
        type: 'boolean',
        default: false
    })
    .help()
    .alias('help', 'h')
    .argv;

async function main() {
    try {
        if (argv.verbose) {
            console.log('Запуск конвертации XML в JSON...');
            console.log(`XML: ${argv.xml}`);
            console.log(`Output: ${argv.output}`);
        }

        // Проверяем существование файлов
        if (!(await FileHandler.fileExists(argv.xml))) {
            throw new Error(`XML файл не найден: ${argv.xml}`);
        }

        // Выполняем конвертацию
        await Converter.convertFile(
            argv.xml,
            argv.output,
            {
                validateXsd: !argv['no-validate'],
                xsdFilePath: argv.xsd
            }
        );

        if (argv.verbose) {
            console.log('Конвертация завершена успешно!');
        } else {
            console.log(`Файл успешно сконвертирован: ${argv.output}`);
        }

    } catch (error) {
        console.error('Ошибка:', error.message);
        if (argv.verbose && error.stack) {
            console.error('Детали ошибки:', error.stack);
        }
        process.exit(1);
    }
    process.exit(0);
}

// Запускаем только если файл выполняется напрямую
if (require.main === module) {
    main();
}

