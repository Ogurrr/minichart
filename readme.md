# MiniChart - minimalist charting liblary
minichart is a minimalist charting library for JavaScript.

## Installation
To add the library to your site, all you need is a link to the Content Delivery Network, e.g. "https://unpkg.com/browse/@ogurrr/minichart@0.0.3/main.min.js"

## Use

### Line Chart

First, you need to create a canvas: ```<canvas id="linear" width="400" height="400"></canvas>```

Then prepare the data: ```
const data = [
{x: 0, y: 0},
{x: 1, y: 1},
{x: 2, y: 1},
{x: 3, y: 1},
{x: 4, y: 5}
]; ```

Create a class object: ```const canvas =
document.getElementById('linear');
const chart = new minichart_line(canvas, 400, 400);```

Create a chart: ```chart.draw(data);```

### To see the rest of the charts, I invite you to the index.html file from the "examples" directory