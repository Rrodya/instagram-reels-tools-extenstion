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
	volumeSlider.value = '100'
	volumeSlider.title = 'Volume'
	controlsContainer.appendChild(volumeSlider)

	// Создаем кнопку поворота
	const button = document.createElement('button')
	button.id = 'rotate-video-btn'
	button.innerHTML = '🔄'
	button.title = 'Rotate Video'
	controlsContainer.appendChild(button)

	let isRotated = false // Флаг для отслеживания состояния поворота

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
		const audioElements = document.querySelectorAll('audio, video')
		audioElements.forEach(audio => {
			audio.volume = volume
		})
	})
}

// Initialize when the page loads
createControls()
