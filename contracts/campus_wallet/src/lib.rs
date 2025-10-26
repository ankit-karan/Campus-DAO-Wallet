#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String as SorobanString, Vec, Error};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Balance(Address),
    Student(Address),
    Event(SorobanString),
}

#[derive(Clone)]
#[contracttype]
pub struct Student {
    pub address: Address,
    pub name: SorobanString,
    pub student_id: SorobanString,
    pub department: SorobanString,
    pub joined_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct Event {
    pub id: SorobanString,
    pub name: SorobanString,
    pub description: SorobanString,
    pub reward_amount: i128,
    pub organizer: Address,
    pub max_participants: u32,
    pub participants: Vec<Address>,
    pub is_active: bool,
}

#[contract]
pub struct CampusWallet;

#[contractimpl]
impl CampusWallet {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    pub fn register_student(
        env: Env,
        student: Address,
        name: SorobanString,
        student_id: SorobanString,
        department: SorobanString,
    ) -> Result<(), Error> {
        student.require_auth();

        if env.storage().instance().has(&DataKey::Student(student.clone())) {
            return Err(Error::from_contract_error(1001)); // Student already registered
        }

        let student_data = Student {
            address: student.clone(),
            name,
            student_id,
            department,
            joined_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Student(student.clone()), &student_data);
        env.storage().instance().set(&DataKey::Balance(student), &0i128);

        Ok(())
    }

    pub fn create_event(
        env: Env,
        organizer: Address,
        id: SorobanString,
        name: SorobanString,
        description: SorobanString,
        reward_amount: i128,
        max_participants: u32,
    ) -> Result<(), Error> {
        organizer.require_auth();

        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if organizer != admin {
            return Err(Error::from_contract_error(1002)); // Only admin can create events
        }

        let event = Event {
            id: id.clone(),
            name,
            description,
            reward_amount,
            organizer,
            max_participants,
            participants: Vec::new(&env),
            is_active: true,
        };

        env.storage().instance().set(&DataKey::Event(id), &event);
        Ok(())
    }

    pub fn attend_event(env: Env, student: Address, event_id: SorobanString) -> Result<(), Error> {
        student.require_auth();

        let mut event: Event = env.storage().instance()
            .get(&DataKey::Event(event_id.clone()))
            .ok_or(Error::from_contract_error(1003))?; // Event not found

        if !event.is_active {
            return Err(Error::from_contract_error(1004)); // Event is not active
        }

        for participant in event.participants.iter() {
            if participant == student {
                return Err(Error::from_contract_error(1005)); // Already participated
            }
        }

        if event.participants.len() as u32 >= event.max_participants {
            return Err(Error::from_contract_error(1006)); // Event is full
        }

        event.participants.push_back(student.clone());
        
        let current_balance: i128 = env.storage().instance()
            .get(&DataKey::Balance(student.clone()))
            .unwrap_or(0);
        let new_balance = current_balance + event.reward_amount;
        
        env.storage().instance().set(&DataKey::Balance(student), &new_balance);
        env.storage().instance().set(&DataKey::Event(event_id), &event);

        Ok(())
    }

    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), Error> {
        from.require_auth();

        if amount <= 0 {
            return Err(Error::from_contract_error(1007)); // Amount must be positive
        }

        let from_balance: i128 = env.storage().instance()
            .get(&DataKey::Balance(from.clone()))
            .unwrap_or(0);
        
        if from_balance < amount {
            return Err(Error::from_contract_error(1008)); // Insufficient balance
        }

        let to_balance: i128 = env.storage().instance()
            .get(&DataKey::Balance(to.clone()))
            .unwrap_or(0);

        env.storage().instance().set(&DataKey::Balance(from), &(from_balance - amount));
        env.storage().instance().set(&DataKey::Balance(to), &(to_balance + amount));

        Ok(())
    }

    pub fn get_balance(env: Env, student: Address) -> Result<i128, Error> {
        Ok(env.storage().instance().get(&DataKey::Balance(student)).unwrap_or(0))
    }

    pub fn get_student(env: Env, student: Address) -> Option<Student> {
        env.storage().instance().get(&DataKey::Student(student))
    }
}