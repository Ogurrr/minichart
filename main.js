class minichart_line {
    constructor(canvas, height, width) {
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        this.context = canvas.getContext("2d"); // Kontekst rysowania
        this.showLabels = true; // Domyślnie pokazujemy podpisy
        this.margin = 30; // Domyślnie ustawiony margines
    }

    // Funkcja do ustawiania koloru linii
    setLineColor(colorHex) {
        this.lineColor = colorHex;
    }

    // Funkcja do włączania/wyłączania wyświetlania podpisów
    toggleLabels(show) {
        this.showLabels = show;
    }

    // Funkcja do ustawiania marginesu
    setMargin(marginValue) {
        if (marginValue >= 0) {
            this.margin = marginValue; // Ustawiamy nowy margines
        } else {
            console.error("Margines musi być liczbą większą lub równą 0.");
        }
    }

    draw(json) {
        // Sprawdzamy, czy dane w JSON są poprawne
        if (!json || !Array.isArray(json) || json.length === 0) {
            console.error("Invalid JSON data.");
            return;
        }

        // Ustawiamy minimalne i maksymalne wartości dla os x i y
        let minX = Math.min(...json.map(point => point.x));
        let maxX = Math.max(...json.map(point => point.x));
        let minY = Math.min(...json.map(point => point.y));
        let maxY = Math.max(...json.map(point => point.y));

        // Skala dla osi X i Y
        let scaleX = (this.width - 2 * this.margin) / (maxX - minX);
        let scaleY = (this.height - 2 * this.margin) / (maxY - minY);

        // Czyszczenie poprzedniego wykresu
        this.context.clearRect(0, 0, this.width, this.height);

        // Rysowanie obramowania wykresu
        this.context.beginPath();
        this.context.rect(this.margin, this.margin, this.width - 2 * this.margin, this.height - 2 * this.margin); // Rysujemy prostokąt wokół wykresu
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 2;
        this.context.stroke();

        // Rysowanie osi
        this.context.beginPath();
        this.context.moveTo(this.margin, this.height - this.margin - (minY * scaleY)); // Oś Y
        this.context.lineTo(this.width - this.margin, this.height - this.margin - (minY * scaleY)); // Oś X
        this.context.strokeStyle = '#000000';
        this.context.stroke();

        // Jeśli włączono podpisy, rysujemy etykiety na osiach
        if (this.showLabels) {
            // Rysowanie skali na osi X
            const stepX = Math.ceil((maxX - minX) / 5); // Podzielimy oś X na 5 części
            for (let i = minX; i <= maxX; i += stepX) {
                const xPos = (i - minX) * scaleX + this.margin; // Przekształcenie wartości do pozycji na osi X
                this.context.beginPath();
                this.context.moveTo(xPos, this.height - this.margin - (minY * scaleY)); // Kreska na osi X
                this.context.lineTo(xPos, this.height - this.margin - (minY * scaleY) + 5); // Kreska na osi X
                this.context.stroke();

                // Etykieta skali na osi X
                this.context.fillStyle = "#000000";
                this.context.font = "10px Arial";
                this.context.fillText(i, xPos - 10, this.height - this.margin - (minY * scaleY) + 15); // Wyswietlenie wartości
            }

            // Rysowanie skali na osi Y
            const stepY = Math.ceil((maxY - minY) / 5); // Podzielimy oś Y na 5 części
            for (let i = minY; i <= maxY; i += stepY) {
                const yPos = this.height - this.margin - (i - minY) * scaleY; // Przekształcenie wartości do pozycji na osi Y
                this.context.beginPath();
                this.context.moveTo(this.margin, yPos); // Kreska na osi Y
                this.context.lineTo(this.margin - 5, yPos); // Kreska na osi Y
                this.context.stroke();

                // Etykieta skali na osi Y
                this.context.fillStyle = "#000000";
                this.context.font = "10px Arial";
                this.context.fillText(i, this.margin - 25, yPos + 5); // Wyswietlenie wartości
            }
        }

        // Rysowanie punktów i linii
        this.context.beginPath();
        json.forEach((point, index) => {
            const x = (point.x - minX) * scaleX + this.margin;
            const y = this.height - this.margin - (point.y - minY) * scaleY;
            
            if (index === 0) {
                this.context.moveTo(x, y); // Pierwszy punkt
            } else {
                this.context.lineTo(x, y); // Kolejne punkty
            }
        });

        // Ustawiamy styl linii
        if (this.lineColor === undefined) {
            this.lineColor = '#3498db'; // Domyślny kolor linii
        }
        this.context.strokeStyle = this.lineColor; // Kolor linii
        this.context.lineWidth = 2;
        this.context.stroke();
    }
}

class minichart_pie {
    constructor(canvas, radius) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d"); // Kontekst rysowania
        this.radius = radius || Math.min(canvas.width, canvas.height) / 2; // Domyślny promień
        this.centerX = canvas.width / 2; // Współrzędna X środka
        this.centerY = canvas.height / 2; // Współrzędna Y środka
    }

    // Funkcja do rysowania wykresu kołowego
    draw(data) {
        // Sprawdzamy, czy dane są poprawne
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error("Invalid data.");
            return;
        }

        let total = 0;
        data.forEach(segment => {
            total += segment.value; // Sumowanie wartości wszystkich segmentów
        });

        let currentAngle = 0;

        // Rysowanie każdego segmentu
        data.forEach(segment => {
            // Obliczanie kąta dla segmentu
            let angle = (segment.value / total) * 2 * Math.PI;

            // Rysowanie segmentu
            this.context.beginPath();
            this.context.moveTo(this.centerX, this.centerY); // Początek - środek koła
            this.context.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + angle); // Łuk
            this.context.fillStyle = segment.color || this.getRandomColor(); // Kolor segmentu
            this.context.fill();

            // Rysowanie podpisu, jeśli jest w danych
            if (segment.label) {
                this.drawLabel(currentAngle, angle, segment.label);
            }

            // Zaktualizowanie kąta do następnego segmentu
            currentAngle += angle;
        });
    }

    // Funkcja pomocnicza do generowania losowego koloru
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    setFont(font) {
        this.font = font;
    }
    setFontColor(colorHex) {
        this.fontColor = colorHex;
    }
    // Funkcja rysująca podpis segmentu
    drawLabel(startAngle, angle, label) {
        const labelAngle = startAngle + angle / 2; // Kąt w połowie segmentu
        const labelX = this.centerX + Math.cos(labelAngle) * (this.radius / 1.5); // Współrzędna X dla podpisu
        const labelY = this.centerY + Math.sin(labelAngle) * (this.radius / 1.5); // Współrzędna Y dla podpisu
        if(this.fontColor === undefined) {
            this.context.fillStyle = "#000000"; // Kolor tekstu
        }
        if(this.font === undefined) {
            this.context.font = "14px Arial"; // Ustawienie czcionki
        }
        this.context.fillText(label, labelX, labelY); // Rysowanie tekstu
    }
}
class minichart_column {
    constructor(canvas, height, width) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d"); // Kontekst rysowania
        this.height = height;
        this.width = width;
    }

    // Funkcja rysująca wykres słupkowy
    draw(data, labelPosition = 'above') {
        // Sprawdzamy, czy dane są poprawne
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error("Invalid data.");
            return;
        }

        // Ustawienie szerokości pojedynczego słupka
        const barWidth = this.width / data.length;

        // Ustalamy maksymalną wartość dla osi Y
        let maxValue = Math.max(...data.map(item => item.value));

        // Rysowanie każdego słupka
        data.forEach((item, index) => {
            const x = index * barWidth; // Pozycja X dla słupka
            const barHeight = (item.value / maxValue) * this.height; // Wysokość słupka

            // Rysowanie słupka
            this.context.beginPath();
            this.context.rect(x, this.height - barHeight, barWidth - 2, barHeight); // Prostokąt
            this.context.fillStyle = item.color || this.getRandomColor(); // Kolor słupka
            this.context.fill();

            // Rysowanie podpisu w zależności od ustawienia
            if (item.label) {
                this.drawLabel(x + barWidth / 2, this.height - barHeight, item.label, labelPosition);
            }
        });
    }

    // Funkcja pomocnicza do generowania losowego koloru
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    setFont(font) {
        this.font = font;
    }
    setFontColor(colorHex) {
        this.fontColor = colorHex;
    }
    // Funkcja rysująca podpis w zależności od pozycji
    drawLabel(x, y, label, labelPosition) {
        if(this.fontColor === undefined) {
            this.context.fillStyle = "#000000"; // Kolor tekstu
        } if (this.font === undefined) {
            this.context.font = "12px Arial"; // Ustawienie czcionki 
        }
        this.context.textAlign = "center"; // Wyrównanie tekstu do środka

        if (labelPosition === 'above') {
            // Podpis nad słupkiem
            this.context.fillText(label, x, y - 5); // Nad słupkiem
        } else if (labelPosition === 'below') {
            // Podpis pod słupkiem
            this.context.fillText(label, x, y + 15); // Pod słupkiem
        } else if (labelPosition === 'inside') {
            // Podpis wewnątrz słupka (obrócony na bok)
            this.context.save(); // Zapisujemy bieżący stan
            this.context.translate(x, y - (y - (this.height - 5)) / 2); // Przemieszczamy do środka słupka
            this.context.rotate(Math.PI / 2); // Obracamy tekst o 90 stopni
            this.context.fillText(label, 0, 0); // Rysujemy tekst
            this.context.restore(); // Przywracamy stan kontekstu
        }
    }
}
class minichart_point {
    constructor(canvas, height, width) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.height = height;
        this.width = width;
        this.tooltip = null;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    // Funkcja rysująca wykres punktowy
    draw(data, labelPosition = 'above', grid = true) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error("Invalid data.");
            return;
        }

        // Skalowanie danych do rozmiarów canvasu
        const scaleX = this.width / 1000;  // Zakładamy, że x mieści się w zakresie 0-1000
        const scaleY = this.height / 1000; // Zakładamy, że y mieści się w zakresie 0-1000

        // Rysowanie siatki, jeśli włączona
        if (grid) {
            this.drawGrid();
        }

        // Rysowanie każdego punktu
        data.forEach(item => {
            // Przekształcenie x, y do zakresu canvasu
            const x = item.x * scaleX;
            const y = this.height - (item.y * scaleY); // Odwrócenie y, żeby 0 było na dole

            // Rysowanie punktu
            this.context.beginPath();
            this.context.arc(x, y, 5, 0, 2 * Math.PI); // Określenie promienia punktu
            this.context.fillStyle = item.color || this.getRandomColor(); // Kolor punktu
            this.context.fill();

            // Rysowanie podpisu, jeśli istnieje
            if (item.label) {
                this.drawLabel(x, y, item.label, labelPosition);
            }

            // Dodanie obsługi tooltipu
            this.canvas.addEventListener('mousemove', (e) => {
                const mouseX = e.offsetX - this.offsetX;
                const mouseY = e.offsetY - this.offsetY;
                const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

                if (distance < 10) { // Jeśli kursor jest blisko punktu
                    this.showTooltip(e, item);
                } else {
                    this.hideTooltip();
                }
            });
        });
    }

    // Funkcja rysująca siatkę
    drawGrid() {
        const stepX = this.width / 10;
        const stepY = this.height / 10;

        // Rysowanie pionowych linii siatki
        for (let i = 0; i <= 10; i++) {
            this.context.beginPath();
            this.context.moveTo(i * stepX, 0);
            this.context.lineTo(i * stepX, this.height);
            this.context.strokeStyle = "#ddd"; // Kolor siatki
            this.context.stroke();
        }

        // Rysowanie poziomych linii siatki
        for (let i = 0; i <= 10; i++) {
            this.context.beginPath();
            this.context.moveTo(0, i * stepY);
            this.context.lineTo(this.width, i * stepY);
            this.context.strokeStyle = "#ddd"; // Kolor siatki
            this.context.stroke();
        }
    }

    // Funkcja pomocnicza do generowania losowego koloru
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // Funkcja ustawiająca czcionkę
    setFont(font) {
        this.font = font;
    }

    // Funkcja ustawiająca kolor czcionki
    setFontColor(colorHex) {
        this.fontColor = colorHex;
    }

    // Funkcja rysująca podpis w zależności od pozycji
    drawLabel(x, y, label, labelPosition) {
        if (this.fontColor === undefined) {
            this.context.fillStyle = "#000000"; // Kolor tekstu, domyślny czarny
        } 
        if (this.font === undefined) {
            this.context.font = "12px Arial"; // Domyślna czcionka
        }
        this.context.textAlign = "center"; // Wyrównanie tekstu do środka

        if (labelPosition === 'above') {
            this.context.fillText(label, x, y - 5); // Nad punktem
        } else if (labelPosition === 'below') {
            this.context.fillText(label, x, y + 15); // Pod punktem
        } else if (labelPosition === 'inside') {
            this.context.save(); 
            this.context.translate(x, y - (y - (this.height - 5)) / 2); 
            this.context.rotate(Math.PI / 2); // Obrót tekstu
            this.context.fillText(label, 0, 0); 
            this.context.restore(); 
        }
    }

    // Funkcja pokazująca tooltip
    showTooltip(e, item) {
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.style.position = 'absolute';
            this.tooltip.style.backgroundColor = '#fff';
            this.tooltip.style.border = '1px solid #ddd';
            this.tooltip.style.padding = '5px';
            this.tooltip.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.2)';
            document.body.appendChild(this.tooltip);
        }

        // Pozycja tooltipa
        this.tooltip.style.left = `${e.pageX + 10}px`;
        this.tooltip.style.top = `${e.pageY + 10}px`;
        this.tooltip.innerHTML = `X: ${item.x}<br>Y: ${item.y}<br>Label: ${item.label}`;
    }

    // Funkcja ukrywająca tooltip
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }
    
}

class minichart_progressbar {
    constructor(canvas, height, width) {
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        this.context = canvas.getContext("2d"); // Rendering context
        this.margin = 10; // Default margin
        this.progress = 0; // Default progress value
    }

    // Function to set the progress value
    setProgress(value) {
        if (value >= 0 && value <= 100) {
            this.progress = value;
        } else {
            console.error("Progress value must be between 0 and 100.");
        }
    }

    // Function to set the margin
    setMargin(marginValue) {
        if (marginValue >= 0) {
            this.margin = marginValue; // Set new margin
        } else {
            console.error("Margin must be a number greater than or equal to 0.");
        }
    }

    draw() {
        // Clear previous drawing
        this.context.clearRect(0, 0, this.width, this.height);

        // Draw the background of the progress bar
        this.context.fillStyle = '#e0e0e0'; // Background color
        this.context.fillRect(this.margin, this.margin, this.width - 2 * this.margin, this.height - 2 * this.margin);

        // Draw the progress bar
        this.context.fillStyle = '#76c7c0'; // Progress bar color
        const progressWidth = (this.width - 2 * this.margin) * (this.progress / 100);
        this.context.fillRect(this.margin, this.margin, progressWidth, this.height - 2 * this.margin);

        // Draw the border of the progress bar
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 2;
        this.context.strokeRect(this.margin, this.margin, this.width - 2 * this.margin, this.height - 2 * this.margin);

        // Draw the progress text
        this.context.fillStyle = '#000000';
        this.context.font = "14px Arial";
        this.context.fillText(`${this.progress}%`, this.width / 2 - 15, this.height / 2 + 5);
    }
}

module.exports = minichart_line, minichart_pie, minichart_column,minichart_point,minichart_progressbar;