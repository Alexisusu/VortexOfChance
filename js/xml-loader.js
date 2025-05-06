export async function loadXMLData(path = 'data.xml') {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(xmlText, 'text/xml');
    } catch (error) {
        console.error('Error loading XML:', error);
        throw error;
    }
}

export function getLotteries(xmlDoc) {
        const lotteries = [];
    const lotteryNodes = xmlDoc.querySelectorAll('lottery');
        
    lotteryNodes.forEach(lotteryNode => {
        const id = lotteryNode.getAttribute('id');
        const name = getElementTextContent(lotteryNode, 'name');
        const description = getElementTextContent(lotteryNode, 'description');
        const price = getElementTextContent(lotteryNode, 'price');
        const jackpot = getElementTextContent(lotteryNode, 'jackpot');
        const imageUrl = getElementTextContent(lotteryNode, 'image');
        const drawDate = getElementTextContent(lotteryNode, 'draw-date');
        const featured = lotteryNode.getAttribute('featured') === 'true';
        const type = lotteryNode.getAttribute('type') || 'regular';
        
        lotteries.push({
            id,
            name,
            description,
            price,
            jackpot,
            imageUrl,
            drawDate,
            featured,
            type
        });
    });
    
    return lotteries;
                }
                
export function getWinners(xmlDoc) {
    const winners = [];
    const winnerNodes = xmlDoc.querySelectorAll('winner');
    
    winnerNodes.forEach(winnerNode => {
        const name = getElementTextContent(winnerNode, 'name');
        const amount = getElementTextContent(winnerNode, 'amount');
        const date = getElementTextContent(winnerNode, 'date');
        const lotteryName = getElementTextContent(winnerNode, 'lottery-name');
        const city = getElementTextContent(winnerNode, 'city');
        
        winners.push({
            name,
            amount,
            date,
            lotteryName,
            city
        });
    });
    
    return winners;
    }

export function getFeaturedSlides(xmlDoc) {
        const slides = [];
    const slideNodes = xmlDoc.querySelectorAll('featured-slide');
    
    slideNodes.forEach(slideNode => {
        const title = getElementTextContent(slideNode, 'title');
        const description = getElementTextContent(slideNode, 'description');
        const imageUrl = getElementTextContent(slideNode, 'image');
        const actionText = getElementTextContent(slideNode, 'action-text');
        const actionUrl = getElementTextContent(slideNode, 'action-url');
        
        slides.push({
            title,
            description,
            imageUrl,
            actionText,
            actionUrl
        });
    });
    
    return slides;
}

export function getUpcomingDraws(xmlDoc) {
    const draws = [];
    const lotteryNodes = xmlDoc.querySelectorAll('lottery');
    
    lotteryNodes.forEach(lotteryNode => {
        const drawDateStr = getElementTextContent(lotteryNode, 'draw-date');
        if (!drawDateStr) return;
                
        const drawDate = new Date(drawDateStr);
        const now = new Date();
        
        if (drawDate > now) {
            draws.push({
                id: lotteryNode.getAttribute('id'),
                name: getElementTextContent(lotteryNode, 'name'),
                drawDate: drawDateStr,
                jackpot: getElementTextContent(lotteryNode, 'jackpot'),
                imageUrl: getElementTextContent(lotteryNode, 'image')
            });
        }
    });
    
    return draws.sort((a, b) => new Date(a.drawDate) - new Date(b.drawDate));
}

function getElementTextContent(parentNode, tagName) {
    const element = parentNode.querySelector(tagName);
    return element ? element.textContent : '';
} 