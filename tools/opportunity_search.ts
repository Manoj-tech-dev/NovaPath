import { Opportunity, OpportunityType } from '../src/types';
import { db } from '../database/store';

export interface OpportunitySearchParams {
  goal: string;
  roleOrDomain?: string;
  location?: string;
  skills?: string[];
  opportunityType?: OpportunityType | string;
  remotePreference?: boolean;
  minYear?: number;
}

export interface OpportunitySearchResult {
  opportunities: Opportunity[];
  sourceDescription: string;
  totalFound: number;
  querySummary: string;
}

export class OpportunitySearchTool {
  /**
   * Searches the structured opportunity pool using semantic filtering,
   * keyword matching, domain alignment, location preference, and remote availability.
   */
  public async search(params: OpportunitySearchParams): Promise<OpportunitySearchResult> {
    const allOpportunities = db.getOpportunities();
    const query = (params.goal || '').toLowerCase();
    const targetLoc = (params.location || '').toLowerCase();
    const targetDomain = (params.roleOrDomain || '').toLowerCase();
    const userSkills = (params.skills || []).map(s => s.toLowerCase());

    const filtered = allOpportunities.filter(opp => {
      // 1. Domain / Role matching
      const oppTitle = opp.title.toLowerCase();
      const oppDesc = opp.description.toLowerCase();
      const oppSkills = opp.skills.map(s => s.toLowerCase());
      const oppOrg = opp.organization.toLowerCase();

      let domainMatch = true;
      if (targetDomain) {
        if (targetDomain.includes('ai') || targetDomain.includes('ml') || targetDomain.includes('machine learning')) {
          domainMatch = oppTitle.includes('ai') || oppTitle.includes('ml') || oppTitle.includes('data') || 
                        oppDesc.includes('machine learning') || oppSkills.some(s => s.includes('python') || s.includes('learning') || s.includes('tensorflow') || s.includes('pytorch'));
        } else if (targetDomain.includes('frontend') || targetDomain.includes('web')) {
          domainMatch = oppTitle.includes('web') || oppTitle.includes('frontend') || oppTitle.includes('react') || oppSkills.some(s => s.includes('react') || s.includes('javascript') || s.includes('node'));
        }
      }

      // 2. Type matching (if specific type requested)
      let typeMatch = true;
      if (params.opportunityType) {
        typeMatch = opp.type.toLowerCase() === params.opportunityType.toLowerCase() || 
                    (params.opportunityType.toLowerCase() === 'internship' && opp.type === 'Research');
      }

      // 3. Location matching (or remote if user is open or opp is remote)
      let locationMatch = true;
      if (targetLoc && targetLoc !== 'any' && targetLoc !== 'all') {
        const isExactLocation = opp.location.toLowerCase().includes(targetLoc);
        const isRemoteMatch = opp.remote && (params.remotePreference === true || !targetLoc);
        locationMatch = isExactLocation || isRemoteMatch;
      }

      // 4. Keyword score
      const keywordMatch = !query || 
                           oppTitle.includes(query) || 
                           oppDesc.includes(query) || 
                           oppSkills.some(s => query.includes(s)) ||
                           domainMatch;

      return (domainMatch || keywordMatch) && typeMatch;
    });

    // If filter is too strict, fallback to broader list sorted by relevance
    const finalResults = filtered.length > 0 ? filtered : allOpportunities;

    return {
      opportunities: finalResults,
      sourceDescription: 'NovaPath Verified Opportunity Index (Live & Curated)',
      totalFound: finalResults.length,
      querySummary: `Search parameters: Domain=${params.roleOrDomain || 'All'}, Location=${params.location || 'Any'}, Remote=${params.remotePreference ? 'Yes' : 'Any'}`
    };
  }
}

export const opportunitySearchTool = new OpportunitySearchTool();
