
/**
 * >=min && <=max
 * @param min 
 * @param max 
 */
function getRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1))
}
class ThumbsUpAni {
    imgsList = [];
    context;
    width = 0;
    height = 0;
    scanning = false;
    renderList=[];
    scaleTime = 0.1;// 百分比
    constructor() {
        this.loadImages();
        const canvas = document.getElementById('thumsCanvas');
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }
    loadImages() {
        const images = [
            'jfs/t1/93992/8/9049/4680/5e0aea04Ec9dd2be8/608efd890fd61486.png',
            'jfs/t1/108305/14/2849/4908/5e0aea04Efb54912c/bfa59f27e654e29c.png',
            'jfs/t1/98805/29/8975/5106/5e0aea05Ed970e2b4/98803f8ad07147b9.png',
            'jfs/t1/94291/26/9105/4344/5e0aea05Ed64b9187/5165fdf5621d5bbf.png',
            'jfs/t1/102753/34/8504/5522/5e0aea05E0b9ef0b4/74a73178e31bd021.png',
            'jfs/t1/102954/26/9241/5069/5e0aea05E7dde8bda/720fcec8bc5be9d4.png'
        ];
        const promiseAll = [];
        images.forEach((src) => {
            const p = new Promise(function (resolve) {
                const img = new Image;
                img.onerror = img.onload = resolve.bind(null, img);
                img.src = 'https://img12.360buyimg.com/img/' + src;
            });
            promiseAll.push(p);
        });
        Promise.all(promiseAll).then((imgsList) => {
            this.imgsList = imgsList.filter((d) => {
                if (d && d.width > 0) return true;
                return false;
            });
            if (this.imgsList.length == 0) {
                dLog('error', 'imgsList load all error');
                return;
            }
        })
    }
    createRender() {
        if (this.imgsList.length == 0) return null;
        const basicScale = [0.6, 0.9, 1.2][getRandom(0, 2)];

        const getScale = (diffTime) => {
            if (diffTime < this.scaleTime) {
                return +((diffTime/ this.scaleTime).toFixed(2)) * basicScale;
            } else {
                return basicScale;
            }
        };
        const context = this.context;
        // 随机读取一个图片来渲染
        const image = this.imgsList[getRandom(0, this.imgsList.length - 1)]
        const offset = 20;
        const basicX = this.width / 2 + getRandom(-offset, offset);
        const angle = getRandom(2, 10);
        let ratio = getRandom(10,30)*((getRandom(0, 1) ? 1 : -1));
        const getTranslateX = (diffTime) => {
            if (diffTime < this.scaleTime) {// 放大期间，不进行摇摆位移
                return basicX;
            } else {
                return basicX + ratio*Math.sin(angle*(diffTime - this.scaleTime));
            }
        };

        const getTranslateY = (diffTime) => {
            return image.height / 2 + (this.height - image.height / 2) * (1-diffTime);
        };

        const fadeOutStage = getRandom(14, 18) / 100;
        const getAlpha = (diffTime) => {
            let left = 1 - +diffTime;
            if (left > fadeOutStage) {
                return 1;
            } else {
                return 1 - +((fadeOutStage - left) / fadeOutStage).toFixed(2);
            }
        };

        return (diffTime) => {
            // 差值满了，即结束了 0 ---》 1
            if(diffTime>=1) return true;
            context.save();
            const scale = getScale(diffTime);
            // const rotate = getRotate();
            const translateX = getTranslateX(diffTime);
            const translateY = getTranslateY(diffTime);
            context.translate(translateX, translateY);
            context.scale(scale, scale);
            // context.rotate(rotate * Math.PI / 180);
            context.globalAlpha = getAlpha(diffTime);
            context.drawImage(
                image,
                -image.width / 2,
                -image.height / 2,
                image.width,
                image.height
            );
            context.restore();
        };
    }
    scan() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.fillStyle = "#f4f4f4";
        this.context.fillRect(0,0,200,400);
        let index = 0;
        let length = this.renderList.length;
        if (length > 0) {
            requestFrame(this.scan.bind(this));
            this.scanning = true;
        } else {
            this.scanning = false;
        }
        while (index < length) {
            const child = this.renderList[index];
            if (!child || !child.render || child.render.call(null, (Date.now() - child.timestamp) / child.duration)) {
                // 结束了，删除该动画
                this.renderList.splice(index, 1);
                length--;
            } else {
                // continue
                index++;
            }
        }
    }
    start() {
        const render = this.createRender();
        const duration = getRandom(1500, 3000);
        this.renderList.push({
            render,
            duration,
            timestamp: Date.now(),
        });
        if (!this.scanning) {
            this.scanning = true;
            requestFrame(this.scan.bind(this));
        }
        return this;
    }
}
function requestFrame(cb) {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      function(callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    )(cb);
  }
