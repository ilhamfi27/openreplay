import React from 'react'
import { connect } from 'react-redux';
import cn from 'classnames';
import { SideMenuitem, SavedSearchList, Popup } from 'UI'
import stl from './sessionMenu.module.css';
import { clearEvents } from 'Duck/filters';
import { issues_types } from 'Types/session/issue'
import { fetchList as fetchSessionList } from 'Duck/sessions';
import { useModal } from 'App/components/Modal';
import SessionSettings from 'Shared/SessionSettings/SessionSettings'

function SessionsMenu(props) {
  const { activeTab, keyMap, wdTypeCount, toggleRehydratePanel, isEnterprise } = props;
  const { showModal } = useModal();

  const onMenuItemClick = (filter) => {
    props.onMenuItemClick(filter)
  }

  return (
    <div className={stl.wrapper}>
      <div className={ cn(stl.header, 'flex items-center') }>
        <div className={ stl.label }>
          <span>Sessions</span>
        </div>
        <span className={ cn(stl.manageButton, 'mr-2') } onClick={() => showModal(<SessionSettings />, { right: true })}>
          <Popup
            hideOnClick={true}
            content={<span>Configure the percentage of sessions <br /> to be captured, timezone and more.</span>}
          >
            Settings
          </Popup>
        </span>
      </div>

      <div>
        <SideMenuitem
          active={activeTab.type === 'all'}
          title="All"
          iconName="play-circle"
          onClick={() => onMenuItemClick({ name: 'All', type: 'all' })}
        />
      </div>

      { issues_types.filter(item => item.visible).map(item => (
        <SideMenuitem
          key={item.key}
          // disabled={!keyMap[item.type] && !wdTypeCount[item.type]}
          active={activeTab.type === item.type}
          title={item.name} iconName={item.icon}
          onClick={() => onMenuItemClick(item)}
        />
      ))}

      <div className={stl.divider} />
      <div className="my-3">
        <SideMenuitem
          title={ isEnterprise ? "Vault" : "Bookmarks" }
          iconName={ isEnterprise ? "safe" : "star" }
          active={activeTab.type === 'bookmark'}
          onClick={() => onMenuItemClick({ name: isEnterprise ? 'Vault' : 'Bookmarks', type: 'bookmark', description: isEnterprise ? 'Sessions saved to vault never get\'s deleted from records.' : '' })}
          // TODO show the description in header
        />
      </div>

      <div className={cn(stl.divider, 'mb-4')} />
      <SavedSearchList />
    </div>
  )
}

export default connect(state => ({
  activeTab: state.getIn([ 'search', 'activeTab' ]),
  keyMap: state.getIn([ 'sessions', 'keyMap' ]),
  wdTypeCount: state.getIn([ 'sessions', 'wdTypeCount' ]),
  captureRate: state.getIn(['watchdogs', 'captureRate']),
  filters: state.getIn([ 'filters', 'appliedFilter' ]),
  sessionsLoading: state.getIn([ 'sessions', 'fetchLiveListRequest', 'loading' ]),
  isEnterprise: state.getIn([ 'user', 'account', 'edition' ]) === 'ee',
}), {
  clearEvents, fetchSessionList
})(SessionsMenu);
