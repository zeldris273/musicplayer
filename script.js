const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'NVPL_PLAYER'

const player = $('.player')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const progressRange = $('.progressRange')
const endTime = $('.endTime');
const rangeValue = $('.rangeValue');
const startTime = $('.startTime');
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const reapetBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volumeSet = $('#volumeAdjust')
const volumeIcon = $('.volume .btn-volume')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    songVolume: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Ngồi nhìn em khóc',
            singer: 'Sáo',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Như anh đã thấy em',
            singer: 'PhucXP, Freak D',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Yêu người có ước mơ',
            singer: 'buitruonglinh',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Ánh sao và bầu trời',
            singer: 'T.R.I',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Chạm khẽ tim anh một chút thôi',
            singer: 'Noo Phước Thịnh',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Đừng khóc',
            singer: 'Nguyên, Koo',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Ngủ sớm đi em',
            singer: 'DucMinh',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        },
        {
            name: 'Still with you',
            singer: 'Jungkook',
            path: './assets/music/song8.mp3',
            image: './assets/img/song8.jpg'
        }
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index="${index}"   >
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth

        // Xử lí CD quay / dừng 
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lí phóng to / thu nhỏ CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lí khi click  play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi xong đang pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const currentProgress = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = currentProgress;
                const currentMinute = Math.floor(audio.currentTime / 60);
                const currentSecond = Math.floor(audio.currentTime % 60)
                rangeValue.innerHTML = `0${currentMinute}:${currentSecond > 9 ? currentSecond : '0' + currentSecond}`;
                startTime.innerHTML = `0${currentMinute}:${currentSecond > 9 ? currentSecond : '0' + currentSecond}`;
                rangeValue.style.left = currentProgress + '%';
                var color = 'linear-gradient(90deg, rgb(9, 241, 21)' + progress.value + '% , rgb(214, 214, 214)' + progress.value + '%)';
                progress.style.background = color;
            }
        }

        audio.onloadeddata = function () {
            _this.songTime = audio.duration.toFixed();
            // _this.songVolume=audio.volume*100; 
            var second = _this.songTime % 60;
            endTime.innerHTML = `0${Math.floor(_this.songTime / 60)}:${second > 9 ? second : '0' + second}`;
        }

        // Xử lí khi tua xong
        progress.oninput = function (e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Mute volume
        volumeIcon.onclick = function () {
            audio.volume = 0;
            _this.songVolume = audio.volume;
            volumeDisplay();
            volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí bật / tắt random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lí lặp lại một song
        reapetBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            reapetBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lí next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
            }
        }

        function volumeDisplay() {
            volumeSet.value = _this.songVolume;
            var volumeColor = 'linear-gradient(90deg, rgb(75, 36, 173)' + _this.songVolume + '%, rgb(214, 214, 214) ' + _this.songVolume + '%)';
            volumeSet.style.background = volumeColor;
        };
        //Volume adjustment
        volumeSet.oninput = function (e) {
            _this.songVolume = e.target.value;
            audio.volume = _this.songVolume / 100;
            volumeDisplay();
            _this.setConfig("volume", _this.songVolume);
            _this.volumeIconHandle();
        };

    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    volumeIconHandle: function () {
        const volume = this.songVolume;
        if (volume > 50) volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>'
        else {
            if (volume >= 5 && volume <= 50) volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>'
            else volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>'
        }

    },
    volumeLoad: function () {
        ///Volume 
        this.songVolume = this.config.volume;
        volumeSet.value = this.songVolume;
        var volumeColor = 'linear-gradient(90deg, rgb(75, 36, 173)' + this.songVolume + '%, rgb(214, 214, 214) ' + this.songVolume + '%)';
        volumeSet.style.background = volumeColor;
        //Icon
        this.volumeIconHandle();

    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();
        // Lắng nghe xử lí các sự kiến
        this.handleEvents()
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng ứng dụng
        this.loadCurrentSong()
        // Render Playlist
        this.render()
        // Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        reapetBtn.classList.toggle('active', this.isRepeat)

        this.volumeLoad()
    }
}

app.start()
