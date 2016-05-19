/*
 * Available information:
 * 1. Request queue
 * Simulator.get_instance().get_requests()
 * Array of integers representing floors where there are people calling the elevator
 * eg: [7,3,2] // There are 3 people waiting for the elevator at floor 7,3, and 2, in that order
 * 
 * 2. Elevator object
 * To get all elevators, Simulator.get_instance().get_building().get_elevator_system().get_elevators()
 * Array of Elevator objects.
 * - Current floor
 * elevator.at_floor()
 * Returns undefined if it is moving and returns the floor if it is waiting.
 * - Destination floor
 * elevator.get_destination_floor()
 * The floor the elevator is moving toward.
 * - Position
 * elevator.get_position()
 * Position of the elevator in y-axis. Not necessarily an integer.
 * - Elevator people
 * elevator.get_people()
 * Array of people inside the elevator
 * 
 * 3. Person object
 * - Floor
 * person.get_floor()
 * - Destination
 * person.get_destination_floor()
 * - Get time waiting for an elevator
 * person.get_wait_time_out_elevator()
 * - Get time waiting in an elevator
 * person.get_wait_time_in_elevator()
 * 
 * 4. Time counter
 * Simulator.get_instance().get_time_counter()
 * An integer increasing by 1 on every simulation iteration
 * 
 * 5. Building
 * Simulator.get_instance().get_building()
 * - Number of floors
 * building.get_num_floors()
 */

Elevator.prototype.decide = function() {
    var simulator = Simulator.get_instance();
    var building = simulator.get_building();
    var num_floors = building.get_num_floors();
    var elevators = Simulator.get_instance().get_building().get_elevator_system().get_elevators();
    var time_counter = simulator.get_time_counter();
    var requests = simulator.get_requests();
    
    var elevator = this;
    var people = this.get_people();
    var person = people.length > 0 ? people[0] : undefined;
    
    if(elevator) {
        elevator.at_floor();
        elevator.get_destination_floor();
        elevator.get_position();
    }

    var people_and_requests = [];

    for (var i = people.length - 1; i >= 0; i--) {
        people_and_requests.push(people[i].get_destination_floor());
    }

    for(var i = 0;i < requests.length;i++) {
        var handled = false;
        for(var j = 0;j < elevators.length;j++) {
            if(elevators[j].get_destination_floor() == requests[i]) {
                handled = true;
                break;
            }
        }
        if(!handled) {
            people_and_requests.push(requests[i]);
        }
    }
    if (people_and_requests.length == 0) {
        return this.commit_decision(Math.floor(num_floors / 2));
    }
    people_and_requests.sort();
    
    var current_floor = this.get_position() / this.get_height() + 1;
    var destination;
    if (this.moving_direction == undefined) {
        var destination_up = get_lowest_person_or_request_higher_than_current_floor(people_and_requests, current_floor);
        var destination_down =get_highest_person_or_request_lower_than_current_floor(people_and_requests, current_floor);
        if (destination_up == undefined)
            destination = destination_down;
        if (destination_down == undefined)
            destination = destination_up;
        if (destination_down != undefined && destination_up != undefined) {
            destination = current_floor - destination_down < destination_up - current_floor ? destination_down : destination_up;
        }
        return this.commit_decision(destination);
    }
    if (this.moving_direction == "UP") {
        destination = get_lowest_person_or_request_higher_than_current_floor(people_and_requests, current_floor);
        if (destination == undefined) {
            this.moving_direction = "DOWN";
            destination = get_highest_person_or_request_lower_than_current_floor(people_and_requests, current_floor);
        }
        return this.commit_decision(destination);
    }
    if (this.moving_direction == "DOWN") {
        destination = get_highest_person_or_request_lower_than_current_floor(people_and_requests, current_floor);
        if (destination == undefined) {
            this.moving_direction = "UP";
            destination = get_lowest_person_or_request_higher_than_current_floor(people_and_requests, current_floor);
        }
        return this.commit_decision(destination);
    }

    this.moving_direction = undefined;
    

    return this.commit_decision(Math.floor(num_floors / 2));
};

function get_lowest_person_or_request_higher_than_current_floor(people_and_requests, current_floor) {
    for (var i = 0; i < people_and_requests.length; ++i) {
        if (people_and_requests[i] > current_floor) {
            return people_and_requests[i];
        }
    }
    return undefined;
}

function get_highest_person_or_request_lower_than_current_floor(people_and_requests, current_floor) {
    for (var i = people_and_requests.length - 1; i >= 0; i--) {
        if (people_and_requests[i] < current_floor) {
            return people_and_requests[i];
        }
    }
    return undefined;
}