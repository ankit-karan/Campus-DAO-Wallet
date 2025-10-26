#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec, String as SorobanString, Error};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Club(SorobanString),
    Member(SorobanString, SorobanString),
    Proposal(u32),
    Vote(u32, SorobanString),
    ClubCounter,
    ProposalCounter,
}

#[derive(Clone)]
#[contracttype]
pub struct Club {
    pub id: SorobanString,
    pub name: SorobanString,
    pub description: SorobanString,
    pub admin: Address,
    pub members: Vec<Address>,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct Proposal {
    pub id: u32,
    pub club_id: SorobanString,
    pub title: SorobanString,
    pub description: SorobanString,
    pub creator: Address,
    pub amount: Option<i128>,
    pub recipient: Option<Address>,
    pub votes_for: u32,
    pub votes_against: u32,
    pub status: ProposalStatus,
    pub created_at: u64,
    pub end_time: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum ProposalStatus {
    Active,
    Approved,
    Rejected,
    Executed,
}

#[contract]
pub struct CampusDAO;

#[contractimpl]
impl CampusDAO {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::ClubCounter, &0u32);
        env.storage().instance().set(&DataKey::ProposalCounter, &0u32);
        Ok(())
    }

    pub fn create_club(
        env: Env,
        creator: Address,
        id: SorobanString,
        name: SorobanString,
        description: SorobanString,
    ) -> Result<(), Error> {
        creator.require_auth();
        
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if creator != admin {
            return Err(Error::from_contract_error(2001)); // Only admin can create clubs
        }

        if env.storage().instance().has(&DataKey::Club(id.clone())) {
            return Err(Error::from_contract_error(2002)); // Club already exists
        }

        let mut members = Vec::new(&env);
        members.push_back(creator.clone());

        let club = Club {
            id: id.clone(),
            name,
            description,
            admin: creator,
            members,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Club(id), &club);
        
        let mut counter: u32 = env.storage().instance().get(&DataKey::ClubCounter).unwrap();
        counter += 1;
        env.storage().instance().set(&DataKey::ClubCounter, &counter);

        Ok(())
    }

    pub fn join_club(env: Env, student: Address, club_id: SorobanString) -> Result<(), Error> {
        student.require_auth();

        let mut club: Club = env.storage().instance().get(&DataKey::Club(club_id.clone()))
            .ok_or(Error::from_contract_error(2003))?; // Club not found

        for member in club.members.iter() {
            if member == student {
                return Err(Error::from_contract_error(2004)); // Already a member
            }
        }

        club.members.push_back(student.clone());
        env.storage().instance().set(&DataKey::Club(club_id), &club);

        Ok(())
    }

    pub fn create_proposal(
        env: Env,
        creator: Address,
        club_id: SorobanString,
        title: SorobanString,
        description: SorobanString,
        amount: Option<i128>,
        recipient: Option<Address>,
        duration_days: u64,
    ) -> Result<u32, Error> {
        creator.require_auth();

        let club: Club = env.storage().instance().get(&DataKey::Club(club_id.clone()))
            .ok_or(Error::from_contract_error(2003))?; // Club not found

        let mut is_member = false;
        for member in club.members.iter() {
            if member == creator {
                is_member = true;
                break;
            }
        }
        if !is_member {
            return Err(Error::from_contract_error(2005)); // Only club members can create proposals
        }

        let mut proposal_counter: u32 = env.storage().instance()
            .get(&DataKey::ProposalCounter).unwrap();
        proposal_counter += 1;

        let proposal = Proposal {
            id: proposal_counter,
            club_id,
            title,
            description,
            creator,
            amount,
            recipient,
            votes_for: 0,
            votes_against: 0,
            status: ProposalStatus::Active,
            created_at: env.ledger().timestamp(),
            end_time: env.ledger().timestamp() + (duration_days * 24 * 60 * 60),
        };

        env.storage().instance().set(&DataKey::Proposal(proposal_counter), &proposal);
        env.storage().instance().set(&DataKey::ProposalCounter, &proposal_counter);

        Ok(proposal_counter)
    }

    pub fn vote(env: Env, voter: Address, proposal_id: u32, support: bool) -> Result<(), Error> {
        voter.require_auth();

        let mut proposal: Proposal = env.storage().instance()
            .get(&DataKey::Proposal(proposal_id))
            .ok_or(Error::from_contract_error(2006))?; // Proposal not found

        if env.ledger().timestamp() > proposal.end_time {
            return Err(Error::from_contract_error(2007)); // Voting period ended
        }

        let vote_key = DataKey::Vote(proposal_id, voter.to_string());
        if env.storage().instance().has(&vote_key) {
            return Err(Error::from_contract_error(2008)); // Already voted
        }

        let club: Club = env.storage().instance()
            .get(&DataKey::Club(proposal.club_id.clone()))
            .ok_or(Error::from_contract_error(2003))?; // Club not found
        
        let mut is_member = false;
        for member in club.members.iter() {
            if member == voter {
                is_member = true;
                break;
            }
        }
        if !is_member {
            return Err(Error::from_contract_error(2005)); // Only club members can vote
        }

        env.storage().instance().set(&vote_key, &support);

        if support {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }

        let total_members = club.members.len() as u32;
        
        if proposal.votes_for > total_members / 2 {
            proposal.status = ProposalStatus::Approved;
        } else if proposal.votes_against >= total_members / 2 {
            proposal.status = ProposalStatus::Rejected;
        }

        env.storage().instance().set(&DataKey::Proposal(proposal_id), &proposal);

        Ok(())
    }

    pub fn get_proposal(env: Env, proposal_id: u32) -> Option<Proposal> {
        env.storage().instance().get(&DataKey::Proposal(proposal_id))
    }

    pub fn get_club(env: Env, club_id: SorobanString) -> Option<Club> {
        env.storage().instance().get(&DataKey::Club(club_id))
    }

    pub fn get_club_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::ClubCounter).unwrap_or(0)
    }
}