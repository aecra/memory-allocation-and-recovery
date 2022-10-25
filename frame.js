let algorithm;
let indicators = {};
let distribution = { filledColors: ['#F5F5F5'] };

function init() {
  let algorithm_type = document.getElementById('algorithm').value;
  let ramSize = parseInt(document.getElementById('ramSize').value);
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
  resetProcessTable();
  randerDistributionStats();
  resetRander(ramSize);
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
      distribution['filledColors'].push(
        `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)})`
      );
      randerDistributionStats();
    }
  }
  const coast = new bootstrap.Toast(
    document.getElementById('allocateLiveToast')
  );
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
      randerDistributionStats();
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
  indicators['external'](emf.total, emf.total - emf.allocated);
  indicators['memory-usage'](mu.total, mu.requested);
}

function resetRander(ramSize) {
  indicators['internal'] = randerIndicator(
    'internal-memory-fragmentation-container',
    '内部碎片率',
    ramSize,
    0
  );
  indicators['external'] = randerIndicator(
    'external-memory-fragmentation-container',
    '外部碎片率',
    ramSize,
    ramSize
  );
  indicators['memory-usage'] = randerIndicator(
    'memory-usage-container',
    '总和内存使用率',
    ramSize,
    0
  );
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
  let dom = document.getElementById(domId);
  let myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false,
  });
  let app = {};
  let ROOT_PATH = 'https://echarts.apache.org/examples';
  let option;

  let _panelImageURL = ROOT_PATH + '/data/asset/img/custom-gauge-panel.png';
  let _animationDuration = 1400;
  let _animationDurationUpdate = 1400;
  let _animationEasingUpdate = 'quarticInOut';
  let _valOnRadianMax = maxValue;
  let _outerRadius = 80;
  let _innerRadius = 60;
  let _pointerInnerRadius = 5;
  let _insidePanelRadius = 45;
  let _title = title;
  let _currentDataIndex = 0;
  function renderItem(params, api) {
    let valOnRadian = api.value(1);
    let coords = api.coord([api.value(0), valOnRadian]);
    let polarEndRadian = coords[3];
    let imageStyle = {
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
              apiDuring.setShape(
                'points',
                makePionterPoints(params, apiDuring.getExtra('polarEndRadian'))
              );
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
            apiDuring.setStyle(
              'text',
              makeText(apiDuring.getExtra('valOnRadian'))
            );
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
      convertToPolarPoint(
        renderItemParams,
        _outerRadius,
        polarEndRadian + Math.PI * 0.03
      ),
      convertToPolarPoint(
        renderItemParams,
        _pointerInnerRadius,
        polarEndRadian
      ),
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
        res =
          title +
          ' ' +
          ((params.value[1] / maxValue) * 100).toFixed(1) +
          '%' +
          '<br/>';
        res += '详细信息' + params.value[1] + '/' + maxValue;
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

  if (option && typeof option === 'object') {
    myChart.setOption(option);
  }

  return function (newMaxValue, newValue) {
    maxValue = newMaxValue;
    value = newValue;
    option.dataset.source = [[1, value]];
    myChart.setOption(option);
  };
}

function randerDistributionStats() {
  let distributionStats = algorithm.getDistributionStats();
  let ramSize = distributionStats[distributionStats.length - 1].end;
  let tips = {};
  let memoryRenderDom = document.getElementById('distribution-stats-container');
  let zr = zrender.init(memoryRenderDom);
  // 图表下方居中显示标题 “内存分配详情”
  let title = new zrender.Text({
    style: {
      text: '内存分配详情',
      x: 0,
      y: 0,
      fill: '#000',
      textFont: '16px Microsoft YaHei',
      textAlign: 'center',
      textVerticalAlign: 'middle',
    },
    position: [
      memoryRenderDom.clientWidth / 2 - 50,
      memoryRenderDom.clientHeight - 20,
    ],
  });
  zr.add(title);
  //取消默认的浏览器自带右键5
  memoryRenderDom.oncontextmenu = (e) => e.preventDefault();
  const memoryRenderWidth = zr.getWidth() - 300;
  distributionStats.forEach((item) => {
    let rect = new zrender.Rect({
      shape: {
        x: (item.start / ramSize) * memoryRenderWidth + 150,
        y: 50,
        width: ((item.end - item.start) / ramSize) * memoryRenderWidth,
        height: 150,
        r: 5,
      },
      style: {
        fill: distribution['filledColors'][item.pid === null ? 0 : item.pid],
      },
    });
    rect.on('mouseover', function (event) {
      // 高度增加 20px, 宽度等比例放大
      {
        let width = rect.shape.width;
        let height = rect.shape.height;
        let x = rect.shape.x;
        let y = rect.shape.y;
        !rect.enlarged &&
          rect.attr({
            shape: {
              x: x - ((width * (height + 20)) / height - width) / 2,
              y: y - 10,
              width: (width * (height + 20)) / height,
              height: height + 20,
            },
            z: 1,
          });
        rect.enlarged = true;
      }
      // 显示提示信息
      {
        let tip = new zrender.Text({
          style: {
            text: `进程 ${item.pid} 占用 ${item.end - item.start}`,
            x: event.offsetX + 20,
            y: event.offsetY + 20,
          },
          zlevel: 1,
        });
        tips[item.pid] = tip;
        zr.add(tip);
      }
    });
    rect.on('mouseout', function (event) {
      // 高度减少 20px, 宽度等比例缩小
      {
        let width = rect.shape.width;
        let height = rect.shape.height;
        let x = rect.shape.x;
        let y = rect.shape.y;
        rect.enlarged &&
          rect.attr({
            shape: {
              x: x + (width - (width * (height - 20)) / height) / 2,
              y: y + 10,
              width: (width * (height - 20)) / height,
              height: height - 20,
            },
            z: 0,
          });
        rect.enlarged = false;
      }
      // 隐藏提示信息
      {
        tips[item.pid] && zr.remove(tips[item.pid]);
        tips[item.pid] = null;
      }
    });
    rect.on('mousemove', function (event) {
      // 移动提示信息
      tips[item.pid] &&
        tips[item.pid].attr('style', {
          x: event.offsetX + 20,
          y: event.offsetY + 20,
        });
    });
    // 为已分配的内存添加右键释放功能
    item.pid &&
      rect.on(
        'contextmenu',
        function () {
          if (!algorithm.free(item.pid)) {
            document.getElementById('free-result').innerHTML = '释放内存失败';
          } else {
            document.getElementById('free-result').innerHTML = '释放内存成功';
            // we need to update the distribution stats and the process table
            updateProcessTable();
            updateRander();
            randerDistributionStats();
          }
        },
        true
      );
    zr.add(rect);
  });

  window.addEventListener('resize', randerDistributionStats);
}

init();
