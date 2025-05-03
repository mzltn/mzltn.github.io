
class Clock {
  static CLOCK_BORDER_WIDTH = 0.03;
  static CLOCK_CENTER_RADIUS = 0.1;
  static CLOCK_NUMBER_FONT_SIZE = 0.20;

  static CLOCK_HOUR_HAND = { WIDTH: 0.07, LENGTH: 0.5 };
  static CLOCK_MINUTE_HAND = { WIDTH: 0.05, LENGTH: 0.8 };

  constructor(canvas, {
    faceColor = '#fff',
    borderColor = '#333',
    centerColor = '#333',
    numberColor = '#000',
    handColor = '#000'
  } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.face_width = Clock.CLOCK_BORDER_WIDTH;
    this.radius = canvas.height / 2 * (1 - this.face_width);
    this.ctx.translate(canvas.width / 2, canvas.height / 2);
    this.baseTransform = this.ctx.getTransform();

    // Assign colors
    this.faceColor = faceColor;
    this.borderColor = borderColor;
    this.centerColor = centerColor;
    this.numberColor = numberColor;
    this.handColor = handColor;
  }

  drawClock(hours, minutes) {
    this.ctx.clearRect(-this.canvas.width / 2, -this.canvas.height / 2, this.canvas.width, this.canvas.height);
    this.drawFace();
    this.drawNumbers();
    this.drawTime(hours, minutes);
    this.drawCenter();
  }

  drawCenter() {
    const ctx = this.ctx;
    const radius = this.radius;

    ctx.beginPath();
    ctx.arc(0, 0, radius * Clock.CLOCK_CENTER_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = this.centerColor;
    ctx.fill();
  }

  drawFace() {
    const ctx = this.ctx;
    const radius = this.radius;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.faceColor;
    ctx.fill();

    ctx.lineWidth = radius * this.face_width;
    ctx.strokeStyle = this.borderColor;
    ctx.stroke();
  }

  drawNumbers() {
    const ctx = this.ctx;
    const radius = this.radius;

    ctx.font = radius * Clock.CLOCK_NUMBER_FONT_SIZE + "px arial";
    ctx.fillStyle = this.numberColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    for (let num = 1; num <= 12; num++) {
      let ang = num * Math.PI / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius * 0.85);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.setTransform(this.baseTransform);
    }
  }

  drawTime(hours, minutes) {
    this.ctx.strokeStyle = this.handColor;

    const hour = hours % 12;
    const hourAngle = (hour * Math.PI / 6) + (minutes * Math.PI / (6 * 60));
    this.drawHand(hourAngle, this.radius * Clock.CLOCK_HOUR_HAND.LENGTH, this.radius * Clock.CLOCK_HOUR_HAND.WIDTH);

    const minuteAngle = (minutes * Math.PI / 30);
    this.drawHand(minuteAngle, this.radius * Clock.CLOCK_MINUTE_HAND.LENGTH, this.radius * Clock.CLOCK_MINUTE_HAND.WIDTH);
  }

  drawHand(pos, length, width) {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.lineWidth = width;
    // ctx.lineCap = "round";
    ctx.moveTo(0, 0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.setTransform(this.baseTransform);
  }
}

