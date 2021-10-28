import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { Redirect } from 'react-router-dom';

const Prices = () => {
  const [prices, setPrices] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState([]);

  useEffect(() => {
    const fetchPrices = async () => {
      const {prices} = await fetch('/config').then(r => r.json());
      setPrices(prices);
    };
    const fetchSubscriptions = async () => {
      const {subscriptions} = await fetch('/subscriptions').then(r => r.json());
      setCurrentSubscription(subscriptions.data.find(item=>item.status==='active'));
    };
    fetchPrices();
    fetchSubscriptions();
  }, [])

  const createSubscription = async (priceId) => {
    if(currentSubscription){
      const {subscription} = await fetch('/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.id,
          priceId
        }),
      }).then(r => r.json());
      console.log('update',subscription);
    } else {
      const {subscriptionId, clientSecret} = await fetch('/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId
        }),
      }).then(r => r.json());

      setSubscriptionData({ subscriptionId, clientSecret });
    }
  }

  if(subscriptionData) {
    return <Redirect to={{
      pathname: '/subscribe',
      state: subscriptionData
    }} />
  }

  return (
    <div>
      <h1>Select a plan</h1>
      <div className="price-list">
        {prices.map((price) => {
          return (
            <div key={price.id}>
              <h3>{price.product.name}</h3>

              <p>
                ${price.unit_amount / 100} / month
              </p>

              <button onClick={() => createSubscription(price.id)}>
                Select
              </button>
            </div>
          )
        })}
      </div>
      <p>current plan</p>
      <div>
        <p >{currentSubscription?.plan?.nickname}</p>
      </div>
    </div>
  );
}

export default withRouter(Prices);
