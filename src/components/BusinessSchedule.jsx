/**
 * Business schedule component showing opening hours
 * @param {Object} props
 * @param {Array} props.schedules - Array of schedule objects with dayOfWeek, startTime, endTime
 */
export default function BusinessSchedule({ schedules }) {
	const daysOfWeek = {
		0: 'Sunday',
		1: 'Monday',
		2: 'Tuesday',
		3: 'Wednesday',
		4: 'Thursday',
		5: 'Friday',
		6: 'Saturday',
	};

	const daysInSpanish = {
		0: 'Domingo',
		1: 'Lunes',
		2: 'Martes',
		3: 'Miércoles',
		4: 'Jueves',
		5: 'Viernes',
		6: 'Sábado',
	};

	// Create a map of day to schedule
	const scheduleMap = {};
	schedules?.forEach((schedule) => {
		scheduleMap[schedule.dayOfWeek] = schedule;
	});

	// Get all days in order
	const allDays = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday

	if (!schedules || schedules.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 font-semibold">No schedule information available</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{allDays.map((day) => {
				const schedule = scheduleMap[day];
				const isOpen = !!schedule;

				return (
					<div
						key={day}
						className={`border-4 border-black p-4 rounded-lg shadow-md transition-all hover:shadow-lg ${
							isOpen ? 'bg-white' : 'bg-gray-100'
						}`}
					>
						<div className="flex flex-col">
							<span className="font-black text-lg mb-2 uppercase">
								{daysInSpanish[day]}
							</span>
							{isOpen ? (
								<div className="flex items-center gap-2">
									<svg
										className="w-5 h-5 text-green-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="font-bold text-gray-700">
										{schedule.startTime} - {schedule.endTime}
									</span>
								</div>
							) : (
								<div className="flex items-center gap-2">
									<svg
										className="w-5 h-5 text-red-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
									<span className="font-bold text-gray-500">Cerrado</span>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
