let loaded = false;
let gradients = [];

export function numberOfPatterns() {
  return gradients.length;
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function loadPatterns() {
  console.log('loadPatterns 1');
  let svg = document.getElementsByTagName('svg')[0];
  if (svg && !loaded) {
    console.log('loadPatterns 2');
    loaded = true;
    let gradientString = [
      `<pattern id='PATTERN_ID' patternUnits='userSpaceOnUse' width='35.584' height='30.585' patternTransform='scale(0.4) rotate(ROTATE_ANGLE)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/><path d='M36.908 9.243c-5.014 0-7.266 3.575-7.266 7.117 0 3.376 2.45 5.726 5.959 5.726 1.307 0 2.45-.463 3.244-1.307.744-.811 1.125-1.903 1.042-3.095-.066-.811-.546-1.655-1.274-2.185-.596-.447-1.639-.894-3.162-.546-.48.1-.778.58-.662 1.06.1.48.58.777 1.06.661.695-.149 1.274-.066 1.705.249.364.265.546.645.562.893.05.679-.165 1.308-.579 1.755-.446.48-1.125.744-1.936.744-2.55 0-4.188-1.538-4.188-3.938 0-2.466 1.44-5.347 5.495-5.347 2.897 0 6.008 1.888 6.388 6.058.166 1.804.067 5.147-2.598 7.034a.868.868 0 00-.142.122c-1.311.783-2.87 1.301-4.972 1.301-4.088 0-6.123-1.952-8.275-4.021-2.317-2.218-4.7-4.518-9.517-4.518-4.094 0-6.439 1.676-8.479 3.545.227-1.102.289-2.307.17-3.596-.496-5.263-4.567-7.662-8.159-7.662-5.015 0-7.265 3.574-7.265 7.116 0 3.377 2.45 5.727 5.958 5.727 1.307 0 2.449-.463 3.243-1.308.745-.81 1.126-1.903 1.043-3.095-.066-.81-.546-1.654-1.274-2.184-.596-.447-1.639-.894-3.161-.546-.48.1-.778.58-.662 1.06.099.48.579.777 1.059.66.695-.148 1.275-.065 1.705.25.364.264.546.645.563.893.05.679-.166 1.307-.58 1.754-.447.48-1.125.745-1.936.745-2.549 0-4.188-1.539-4.188-3.939 0-2.466 1.44-5.345 5.495-5.345 2.897 0 6.008 1.87 6.389 6.057.163 1.781.064 5.06-2.504 6.96-1.36.864-2.978 1.447-5.209 1.447-4.088 0-6.124-1.952-8.275-4.021-2.317-2.218-4.7-4.518-9.516-4.518v1.787c4.088 0 6.123 1.953 8.275 4.022 2.317 2.218 4.7 4.518 9.516 4.518 4.8 0 7.2-2.3 9.517-4.518 2.151-2.069 4.187-4.022 8.275-4.022s6.124 1.953 8.275 4.022c2.318 2.218 4.701 4.518 9.517 4.518 4.8 0 7.2-2.3 9.516-4.518 2.152-2.069 4.188-4.022 8.276-4.022s6.123 1.953 8.275 4.022c2.317 2.218 4.7 4.518 9.517 4.518v-1.788c-4.088 0-6.124-1.952-8.275-4.021-2.318-2.218-4.701-4.518-9.517-4.518-4.103 0-6.45 1.683-8.492 3.556.237-1.118.304-2.343.184-3.656-.497-5.263-4.568-7.663-8.16-7.663z'  stroke-width='1' stroke='none' fill='hsla(259, 100%, 0%, 1)'/><path d='M23.42 41.086a.896.896 0 01-.729-.38.883.883 0 01.215-1.242c2.665-1.887 2.764-5.23 2.599-7.034-.38-4.187-3.492-6.058-6.389-6.058-4.055 0-5.495 2.88-5.495 5.346 0 2.4 1.639 3.94 4.188 3.94.81 0 1.49-.265 1.936-.745.414-.447.63-1.076.58-1.755-.017-.248-.2-.629-.547-.893-.43-.315-1.026-.398-1.704-.249a.868.868 0 01-1.06-.662.868.868 0 01.662-1.059c1.523-.348 2.566.1 3.161.546.729.53 1.209 1.374 1.275 2.185.083 1.191-.298 2.284-1.043 3.095-.794.844-1.936 1.307-3.244 1.307-3.508 0-5.958-2.35-5.958-5.726 0-3.542 2.25-7.117 7.266-7.117 3.591 0 7.663 2.4 8.16 7.663.347 3.79-.828 6.868-3.344 8.656a.824.824 0 01-.53.182zm0-30.585a.896.896 0 01-.729-.38.883.883 0 01.215-1.242c2.665-1.887 2.764-5.23 2.599-7.034-.381-4.187-3.493-6.058-6.389-6.058-4.055 0-5.495 2.88-5.495 5.346 0 2.4 1.639 3.94 4.188 3.94.81 0 1.49-.266 1.936-.746.414-.446.629-1.075.58-1.754-.017-.248-.2-.629-.547-.894-.43-.314-1.026-.397-1.705-.248A.868.868 0 0117.014.77a.868.868 0 01.662-1.06c1.523-.347 2.566.1 3.161.547.729.53 1.209 1.374 1.275 2.185.083 1.191-.298 2.284-1.043 3.095-.794.844-1.936 1.307-3.244 1.307-3.508 0-5.958-2.35-5.958-5.726 0-3.542 2.25-7.117 7.266-7.117 3.591 0 7.663 2.4 8.16 7.663.347 3.79-.828 6.868-3.344 8.656a.824.824 0 01-.53.182zm29.956 1.572c-4.8 0-7.2-2.3-9.517-4.518-2.151-2.069-4.187-4.022-8.275-4.022S29.46 5.486 27.31 7.555c-2.317 2.218-4.7 4.518-9.517 4.518-4.8 0-7.2-2.3-9.516-4.518C6.124 5.486 4.088 3.533 0 3.533s-6.124 1.953-8.275 4.022c-2.317 2.218-4.7 4.518-9.517 4.518-4.8 0-7.2-2.3-9.516-4.518-2.152-2.069-4.188-4.022-8.276-4.022V1.746c4.8 0 7.2 2.3 9.517 4.518 2.152 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.276-4.022C-7.2 4.046-4.816 1.746 0 1.746c4.8 0 7.2 2.3 9.517 4.518 2.151 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.275-4.022c2.318-2.218 4.7-4.518 9.517-4.518 4.8 0 7.2 2.3 9.517 4.518 2.151 2.069 4.187 4.022 8.275 4.022s6.124-1.953 8.275-4.022c2.317-2.218 4.7-4.518 9.517-4.518v1.787c-4.088 0-6.124 1.953-8.275 4.022-2.317 2.234-4.717 4.518-9.517 4.518z'  stroke-width='1' stroke='none' fill='hsla(259, 100%, 0%, 1)'/></pattern>`,
      `<pattern id='PATTERN_ID' patternUnits='userSpaceOnUse' width='40' height='20' patternTransform='scale(0.2) rotate(ROTATE_ANGLE)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/><path d='M-4.798 13.573C-3.149 12.533-1.446 11.306 0 10c2.812-2.758 6.18-4.974 10-5 4.183.336 7.193 2.456 10 5 2.86 2.687 6.216 4.952 10 5 4.185-.315 7.35-2.48 10-5 1.452-1.386 3.107-3.085 4.793-4.176'  stroke-width='5.5' stroke='hsla(259, 100%, 0%, 1)' fill='none'/></pattern>`,
      `<pattern id='PATTERN_ID' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(0.25) rotate(ROTATE_ANGLE)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M 10,-2.55e-7 V 20 Z M -1.1677362e-8,10 H 20 Z'  stroke-width='5' stroke='hsla(0, 0%, 0%, 1)' fill='none'/></pattern>`,
      `<pattern id='PATTERN_ID' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(0.45) rotate(ROTATE_ANGLE)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M10-10L20 0v10L10 0zM20 0L10-10V0l10 10zm0 10L10 0v10l10 10zm0 10L10 10v10l10 10zM0 20l10-10v10L0 30zm0-10L10 0v10L0 20zM0 0l10-10V0L0 10z'  stroke-width='2.5' stroke='hsla(0, 0%, 0%, 1)' fill='none'/></pattern></defs>`
    ];

    for (let j = 0; j < gradientString.length; j++) {
      for (let i = 0; i < 360; i+= 15) {
        gradients.push(
          gradientString[j]
            .replace('ROTATE_ANGLE', i)
            .replace('PATTERN_ID', 'stripes' + (gradients.length + 1))
        );
      }
    }

    console.log(gradients);
    window.gradients = gradients;

    gradients = shuffle(gradients);

    let svgDefs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');

    for (let i = 0; i < gradients.length; i++) {
      svgDefs.insertAdjacentHTML('afterbegin', gradients[i]);
    }
  
    svg.appendChild(svgDefs);
  }
}

let i = 0;
export function nextPattern() {
  const result = 'stripes' + ((i++ % numberOfPatterns()) + 1);

  console.log('nextPattern ' + result);

  return result;
}



