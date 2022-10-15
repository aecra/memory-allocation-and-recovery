let algorithm;
let indicators = {};

function init() {
  let algorithm_type = document.getElementById('algorithm').value;
  let ramSize = parseInt(document.getElementById('ramSize').value);
  resetProcessTable();
  resetRander(ramSize);
  switch (algorithm_type) {
    case '1':
      algorithm = new FirstFit(ramSize);
      break;
    case '2':
      algorithm = new BestFit(ramSize);
      break;
    case '3':
      algorithm = new NextFit(ramSize);
      break;
    case '4':
      algorithm = new WorstFit(ramSize);
      break;
    case '5':
      algorithm = new TwoLevelSegregatedFit(ramSize);
      break;
    case '6':
      algorithm = new BuddySystem(ramSize);
      break;
    case '7':
      algorithm = new Paging(ramSize);
      break;
    case '8':
      algorithm = new Segmentation(ramSize);
      break;
    case '9':
      algorithm = new SegmentationPaging(ramSize);
      break;
    default:
      break;
  }
}

function allocate() {
  let size = document.getElementById('size').value;
  if (size === '') {
    document.getElementById('allocate-result').innerHTML = '请输入内存大小';
  } else {
    if (!algorithm.allocate(size)) {
      document.getElementById('allocate-result').innerHTML = '申请内存失败';
    } else {
      document.getElementById('allocate-result').innerHTML = '申请内存成功';
      // we need to update the distribution stats and the process table
      updateProcessTable();
      updateRander();
    }
  }
  const coast = new bootstrap.Toast(document.getElementById('allocateLiveToast'));
  coast.show();
}

function free() {
  let pid = document.getElementById('pid').value;
  if (pid === '') {
    document.getElementById('free-result').innerHTML = '请输入进程号';
  } else {
    if (!algorithm.free(pid)) {
      document.getElementById('free-result').innerHTML = '释放内存失败';
    } else {
      document.getElementById('free-result').innerHTML = '释放内存成功';
      // we need to update the distribution stats and the process table
      updateProcessTable();
      updateRander();
    }
  }
  const coast = new bootstrap.Toast(document.getElementById('freeLiveToast'));
  coast.show();
}

function updateRander() {
  // update the distribution stats
  const imf = algorithm.getInternalMemoryFragmentation();
  const emf = algorithm.getExternalMemoryFragmentation();
  const mu = algorithm.getMemoryUsage();
  indicators['internal'](imf.allocated, imf.allocated - imf.requested);
  indicators['external'](emf.total, emf.total-emf.allocated);
  indicators['memory-usage'](mu.total, mu.requested);
}

function resetRander(ramSize) {
  indicators['internal'] = randerIndicator('internal-memory-fragmentation-container', '内部碎片率', ramSize, 0);
  indicators['external'] = randerIndicator('external-memory-fragmentation-container', '外部碎片率', ramSize, ramSize);
  indicators['memory-usage'] = randerIndicator('memory-usage-container', '总和内存使用率', ramSize, 0);
}

function updateProcessTable() {
  // update the process table
  let processes = algorithm.getProcesses();
  processes.sort((a, b) => a.pid - b.pid);
  let table = document.getElementById('process-table');
  table.innerHTML = '';
  for (let i = 0; i < processes.length; i++) {
    let row = table.insertRow(i);
    let pid = row.insertCell(0);
    let size = row.insertCell(1);
    pid.innerHTML = processes[i].pid;
    size.innerHTML = processes[i].size;
  }
}

function resetProcessTable() {
  let table = document.getElementById('process-table');
  table.innerHTML = '';
}

function randerIndicator(domId, title, maxValue, value) {
  var dom = document.getElementById(domId);
  var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false,
  });
  var app = {};
  var ROOT_PATH = 'https://echarts.apache.org/examples';
  var option;

  var _panelImageURL = ROOT_PATH + '/data/asset/img/custom-gauge-panel.png';
  var _animationDuration = 1400;
  var _animationDurationUpdate = 1400;
  var _animationEasingUpdate = 'quarticInOut';
  var _valOnRadianMax = maxValue;
  var _outerRadius = 80;
  var _innerRadius = 60;
  var _pointerInnerRadius = 5;
  var _insidePanelRadius = 45;
  var _title = title;
  var _currentDataIndex = 0;
  function renderItem(params, api) {
    var valOnRadian = api.value(1);
    var coords = api.coord([api.value(0), valOnRadian]);
    var polarEndRadian = coords[3];
    var imageStyle = {
      image: _panelImageURL,
      x: params.coordSys.cx - _outerRadius,
      y: params.coordSys.cy - _outerRadius,
      width: _outerRadius * 2,
      height: _outerRadius * 2,
    };
    return {
      type: 'group',
      children: [
        {
          type: 'image',
          style: imageStyle,
          clipPath: {
            type: 'sector',
            shape: {
              cx: params.coordSys.cx,
              cy: params.coordSys.cy,
              r: _outerRadius,
              r0: _innerRadius,
              startAngle: 0,
              endAngle: -polarEndRadian,
              transition: 'endAngle',
              enterFrom: { endAngle: 0 },
            },
          },
        },
        {
          type: 'image',
          style: imageStyle,
          clipPath: {
            type: 'polygon',
            shape: {
              points: makePionterPoints(params, polarEndRadian),
            },
            extra: {
              polarEndRadian: polarEndRadian,
              transition: 'polarEndRadian',
              enterFrom: { polarEndRadian: 0 },
            },
            during: function (apiDuring) {
              apiDuring.setShape('points', makePionterPoints(params, apiDuring.getExtra('polarEndRadian')));
            },
          },
        },
        {
          type: 'circle',
          shape: {
            cx: params.coordSys.cx,
            cy: params.coordSys.cy,
            r: _insidePanelRadius,
          },
          style: {
            fill: '#fff',
            shadowBlur: 25,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(76,107,167,0.4)',
          },
        },
        {
          type: 'text',
          extra: {
            valOnRadian: valOnRadian,
            transition: 'valOnRadian',
            enterFrom: { valOnRadian: 0 },
          },
          style: {
            text: makeText(valOnRadian),
            fontSize: 22,
            fontWeight: 350,
            x: params.coordSys.cx,
            y: params.coordSys.cy,
            fill: 'rgb(0,50,190)',
            align: 'center',
            verticalAlign: 'middle',
            enterFrom: { opacity: 0 },
          },
          during: function (apiDuring) {
            apiDuring.setStyle('text', makeText(apiDuring.getExtra('valOnRadian')));
          },
        },
        {
          type: 'text',
          extra: {
            valOnRadian: valOnRadian,
            transition: 'valOnRadian',
            enterFrom: { valOnRadian: 0 },
          },
          style: {
            text: '● ' + _title,
            fontSize: 18,
            fontWeight: 350,
            x: params.coordSys.cx,
            y: params.coordSys.cy + _outerRadius + 20,
            fill: 'rgb(0,50,190)',
            align: 'center',
            enterFrom: { opacity: 0 },
          },
        },
      ],
    };
  }
  function convertToPolarPoint(renderItemParams, radius, radian) {
    return [
      Math.cos(radian) * radius + renderItemParams.coordSys.cx,
      -Math.sin(radian) * radius + renderItemParams.coordSys.cy,
    ];
  }
  function makePionterPoints(renderItemParams, polarEndRadian) {
    return [
      convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian),
      convertToPolarPoint(renderItemParams, _outerRadius, polarEndRadian + Math.PI * 0.03),
      convertToPolarPoint(renderItemParams, _pointerInnerRadius, polarEndRadian),
    ];
  }
  function makeText(valOnRadian) {
    // Validate additive animation calc.
    if (valOnRadian < -10) {
      alert('illegal during val: ' + valOnRadian);
    }
    return ((valOnRadian / _valOnRadianMax) * 100).toFixed(1) + '%';
  }
  option = {
    animationEasing: _animationEasingUpdate,
    animationDuration: _animationDuration,
    animationDurationUpdate: _animationDurationUpdate,
    animationEasingUpdate: _animationEasingUpdate,
    dataset: {
      source: [[1, value]],
    },
    tooltip: {
      formatter: function (params) {
        res = title + ' ' + params.value[1] + '%' + '<br/>';
        res += '使用情况' + value + '/' + maxValue;
        return res;
      },
    },
    angleAxis: {
      type: 'value',
      startAngle: 0,
      show: false,
      min: 0,
      max: _valOnRadianMax,
    },
    radiusAxis: {
      type: 'value',
      show: false,
    },
    polar: {},
    series: [
      {
        type: 'custom',
        coordinateSystem: 'polar',
        renderItem: renderItem,
      },
    ],
  };
  // setInterval(function () {
  //   var nextSource = [[1, Math.round(Math.random() * _valOnRadianMax)]];
  //   myChart.setOption({
  //     dataset: {
  //       source: nextSource
  //     }
  //   });
  // }, 3000);

  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }

  // window.addEventListener('resize', myChart.resize);

  return function (newMaxValue, newValue) {
    maxValue = newMaxValue;
    value = newValue;
    option.dataset.source = [[1, value]];
    myChart.setOption(option);
  };
}

function randerDistributionStats() {
  console.log('假装渲染了分配统计');
}

init();
