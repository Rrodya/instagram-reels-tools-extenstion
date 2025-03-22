// Create and add the rotation button and volume slider
function createControls() {
	// Создаем контейнер для элементов управления
	const controlsContainer = document.createElement('div')
	controlsContainer.id = 'video-controls'
	controlsContainer.style.cssText = `
		position: fixed;
		bottom: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		z-index: 9999;
	`
	document.body.appendChild(controlsContainer)

	// Создаем ползунок громкости
	const volumeSlider = document.createElement('input')
	volumeSlider.type = 'range'
	volumeSlider.id = 'volume-slider'
	volumeSlider.min = '0'
	volumeSlider.max = '100'
	volumeSlider.value = '10'
	volumeSlider.title = 'Volume'
	controlsContainer.appendChild(volumeSlider)

	// Создаем кнопку поворота
	const button = document.createElement('button')
	button.id = 'rotate-video-btn'
	button.innerHTML = '🔄'
	button.title = 'Rotate Video'
	controlsContainer.appendChild(button)

	let isRotated = false // Флаг для отслеживания состояния поворота
	let currentVolume = 0.1 // Текущая громкость (10% по умолчанию)

	// Функция для проверки, находится ли элемент в центре viewport
	function isElementInViewportCenter(element) {
		const rect = element.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const viewportCenter = window.scrollY + viewportHeight / 2
		const elementCenter = window.scrollY + rect.top + rect.height / 2

		// Проверяем, находится ли центр элемента в пределах 20% от центра viewport
		const tolerance = viewportHeight * 0.2
		return Math.abs(elementCenter - viewportCenter) < tolerance
	}

	// Функция для установки громкости всем видео
	function setVolumeToAllVideos(volume) {
		currentVolume = volume
		const audioElements = document.querySelectorAll('audio, video')
		audioElements.forEach(audio => {
			audio.volume = volume
		})
	}

	// Создаем IntersectionObserver для отслеживания видео, входящих в viewport
	const videoObserver = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const video = entry.target
					video.volume = currentVolume
				}
			})
		},
		{
			// Наблюдаем за пересечением с верхней и нижней границей viewport
			rootMargin: '0px',
			threshold: 0.1, // Срабатывает когда 10% видео видно
		}
	)

	// Множество для отслеживания наблюдаемых видео
	const observedVideos = new Set()

	// Функция для добавления видео в наблюдение
	function observeVideo(video) {
		// Проверяем, не наблюдаем ли мы уже это видео
		if (observedVideos.has(video)) {
			return
		}

		videoObserver.observe(video)
		observedVideos.add(video)

		// Добавляем обработчик для удаления видео
		video.addEventListener('remove', () => {
			unobserveVideo(video)
		})
	}

	// Функция для удаления видео из наблюдения
	function unobserveVideo(video) {
		if (observedVideos.has(video)) {
			videoObserver.unobserve(video)
			observedVideos.delete(video)
		}
	}

	// Создаем MutationObserver для отслеживания новых и удаленных видео
	const mutationObserver = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			// Обработка добавленных узлов
			if (mutation.addedNodes.length) {
				mutation.addedNodes.forEach(node => {
					if (node.nodeType === 1) {
						const videos = node.querySelectorAll('video, audio')
						videos.forEach(video => {
							observeVideo(video)
						})
					}
				})
			}

			// Обработка удаленных узлов
			if (mutation.removedNodes.length) {
				mutation.removedNodes.forEach(node => {
					if (node.nodeType === 1) {
						const videos = node.querySelectorAll('video, audio')
						videos.forEach(video => {
							unobserveVideo(video)
						})
					}
				})
			}
		})
	})

	// Начинаем наблюдение за изменениями в DOM
	mutationObserver.observe(document.body, {
		childList: true,
		subtree: true,
	})

	// Начинаем наблюдение за всеми существующими видео
	document.querySelectorAll('video, audio').forEach(video => {
		observeVideo(video)
	})

	// Обработчик для кнопки поворота
	button.addEventListener('click', () => {
		const elements = document.querySelectorAll('[style]')
		const video = Array.from(elements).find(element => {
			const style = element.getAttribute('style')
			return (
				style &&
				style.includes('height') &&
				style.includes('width') &&
				isElementInViewportCenter(element)
			)
		})

		if (video) {
			if (!isRotated) {
				video.style.transform = 'rotate(-90deg)'
				isRotated = true
			} else {
				video.style.transform = 'rotate(0deg)'
				isRotated = false
			}
		}
	})

	// Обработчик для ползунка громкости
	volumeSlider.addEventListener('input', e => {
		const volume = e.target.value / 100
		setVolumeToAllVideos(volume)
	})

	// Устанавливаем начальную громкость для всех существующих видео
	setVolumeToAllVideos(0.1)
}

// Initialize when the page loads
createControls()
