/**
 * Утилиты для работы с XML вместо JSON
 */

/**
 * Преобразует JavaScript объект в XML строку
 * @param {Object} obj - объект для преобразования
 * @param {string} rootName - название корневого элемента
 * @returns {string} - XML строка
 */
export function objectToXML(obj, rootName = 'data') {
    const xmlDoc = document.implementation.createDocument(null, rootName);
    
    function processObject(object, parentNode) {
        for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
                const value = object[key];
                
                // Обработка массивов
                if (Array.isArray(value)) {
                    const arrayNode = xmlDoc.createElement('array');
                    arrayNode.setAttribute('name', key);
                    parentNode.appendChild(arrayNode);
                    
                    value.forEach((item, index) => {
                        const itemNode = xmlDoc.createElement('item');
                        itemNode.setAttribute('index', index);
                        
                        if (typeof item === 'object' && item !== null) {
                            processObject(item, itemNode);
                        } else {
                            itemNode.textContent = String(item);
                        }
                        
                        arrayNode.appendChild(itemNode);
                    });
                }
                // Обработка объектов
                else if (typeof value === 'object' && value !== null) {
                    const objNode = xmlDoc.createElement('object');
                    objNode.setAttribute('name', key);
                    parentNode.appendChild(objNode);
                    processObject(value, objNode);
                }
                // Обработка примитивных типов
                else {
                    const element = xmlDoc.createElement(key);
                    element.textContent = String(value);
                    parentNode.appendChild(element);
                }
            }
        }
    }
    
    processObject(obj, xmlDoc.documentElement);
    
    // Преобразование XML документа в строку
    const serializer = new XMLSerializer();
    return serializer.serializeToString(xmlDoc);
}

/**
 * Преобразует XML строку в JavaScript объект
 * @param {string} xmlString - XML строка
 * @returns {Object} - JavaScript объект
 */
export function xmlToObject(xmlString) {
    if (!xmlString || xmlString === '[]' || xmlString === '{}') {
        return xmlString === '[]' ? [] : {};
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    function processNode(node) {
        // Обработка массивов
        if (node.nodeName === 'array') {
            const result = [];
            const items = node.querySelectorAll(':scope > item');
            
            items.forEach(item => {
                // Определяем тип содержимого элемента массива
                if (item.children.length === 0) {
                    // Примитивное значение
                    result.push(parseValue(item.textContent));
                } else if (item.children.length === 1 && item.firstElementChild.nodeName === 'object') {
                    // Объект внутри элемента массива
                    result.push(processNode(item.firstElementChild));
                } else {
                    // Объект, представленный несколькими элементами
                    result.push(processChildNodes(item));
                }
            });
            
            return result;
        }
        // Обработка объектов
        else if (node.nodeName === 'object') {
            return processChildNodes(node);
        }
        // Корневой элемент
        else {
            return processChildNodes(node);
        }
    }
    
    function processChildNodes(node) {
        const result = {};
        
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            
            if (child.nodeName === 'array') {
                result[child.getAttribute('name')] = processNode(child);
            } else if (child.nodeName === 'object') {
                result[child.getAttribute('name')] = processNode(child);
            } else {
                if (child.children.length === 0) {
                    result[child.nodeName] = parseValue(child.textContent);
                } else {
                    result[child.nodeName] = processChildNodes(child);
                }
            }
        }
        
        return result;
    }
    
    function parseValue(value) {
        // Попытка преобразовать строку в соответствующий тип данных
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (value === 'null') return null;
        if (value === 'undefined') return undefined;
        
        // Попытка преобразовать в число
        const numberValue = Number(value);
        if (!isNaN(numberValue) && value.trim() !== '') return numberValue;
        
        // Иначе возвращаем строку
        return value;
    }
    
    return processNode(xmlDoc.documentElement);
}

/**
 * Альтернатива JSON.parse для XML
 * @param {string} xmlString - XML строка или пустая строка для значения по умолчанию
 * @param {string} defaultValue - значение по умолчанию
 * @returns {Object} - JavaScript объект
 */
export function parseXML(xmlString, defaultValue = '{}') {
    console.log('parseXML вызван с данными длиной:', xmlString ? xmlString.length : 0);
    
    try {
        if (!xmlString || xmlString.trim() === '') {
            console.log('parseXML: пустые данные, возвращаем значение по умолчанию');
            return xmlToObject(defaultValue);
        }
        
        // Проверка на корректность XML
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');
        
        // Проверка на ошибки разбора XML
        const parseError = doc.querySelector('parsererror');
        if (parseError) {
            console.error('Ошибка при разборе XML:', parseError.textContent);
            console.log('XML с ошибкой:', xmlString);
            throw new Error('Некорректный формат XML');
        }
        
        // Успешный разбор XML
        console.log('parseXML: успешно разобран XML документ');
        const result = xmlToObject(xmlString);
        console.log('parseXML: результат разбора:', result);
        return result;
    } catch (e) {
        console.error('Ошибка в parseXML:', e);
        console.log('Возвращаем значение по умолчанию после ошибки');
        return xmlToObject(defaultValue);
    }
}

/**
 * Альтернатива JSON.stringify для XML
 * @param {Object} obj - объект для преобразования
 * @param {string} rootName - название корневого элемента
 * @returns {string} - XML строка
 */
export function stringifyXML(obj, rootName = 'data') {
    if (obj === null || obj === undefined) {
        return '';
    }
    return objectToXML(obj, rootName);
} 