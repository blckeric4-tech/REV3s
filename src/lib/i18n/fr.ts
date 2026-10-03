import type { Dictionary } from "./en";

/**
 * French catalogue. Typed as a full `Dictionary`, so a key added to `en.ts` and
 * forgotten here is a compile error — not a page that quietly falls back to
 * English.
 *
 * Register: the shop is aimed at Rwanda and francophone East Africa, so this
 * uses standard European French with the informal "vous" form for customers and
 * the formal register the admin expects. Currency, delivery thresholds and
 * product names stay as the shop owner wrote them; see `index.ts`.
 */
export const fr: Dictionary = {
  // ── Language switcher ──────────────────────────────────────────────
  "lang.switch": "Langue",
  "lang.switchTo": "Changer la langue en Français",
  "lang.current": "Langue actuelle : {code}",
  "lang.toEn": "Switch to English",
  "lang.toFr": "Passer en français",

  // ── Header ─────────────────────────────────────────────────────────
  "nav.shop": "Boutique",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.shipping": "Livraison",
  "nav.sizeGuide": "Guide des tailles",
  "nav.account": "Mon compte",
  "nav.orders": "Mes commandes",
  "nav.details": "Détails",
  "nav.signIn": "Connexion",
  "nav.signOut": "Déconnexion",
  "nav.signUp": "Créer un compte",
  "nav.menu": "Menu",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.cart": "Panier",
  "nav.cartEmpty": "Panier, vide",
  "nav.cartItems": "Panier, {count} articles",
  "nav.cartOneItem": "Panier, 1 article",
  "nav.skipToContent": "Aller au contenu",
  "nav.newIn": "Nouveautés",

  // ── Product card / shop controls ───────────────────────────────────
  "shop.title": "Toute la collection",
  "shop.sort": "Trier",
  "shop.sortNewest": "Plus récents",
  "shop.sortPriceAsc": "Prix : croissant",
  "shop.sortPriceDesc": "Prix : décroissant",
  "shop.sortNameAsc": "Nom : A à Z",
  "shop.filterCategory": "Catégorie",
  "shop.allCategories": "Toutes les catégories",
  "shop.search": "Rechercher",
  "shop.searchPlaceholder": "Rechercher un article",
  "shop.resultsCount": "{count} articles",
  "shop.resultsCountOne": "1 article",
  "shop.empty": "Aucun article ne correspond.",
  "shop.clearFilters": "Effacer les filtres",

  // ── Product detail ─────────────────────────────────────────────────
  "product.addToBag": "Ajouter au panier",
  "product.added": "Ajouté",
  "product.selectSize": "Choisissez une taille",
  "product.sizeGuide": "Guide des tailles",
  "product.colour": "Couleur",
  "product.size": "Taille",
  "product.quantity": "Quantité",
  "product.outOfStock": "Rupture de stock",
  "product.lowStock": "Plus que {count} en stock",
  "product.inStock": "En stock",
  "product.description": "Détails",
  "product.notFound": "Produit introuvable",
  "product.related": "Vous aimerez aussi",
  "product.backToShop": "Retour à la boutique",

  // ── Cart ───────────────────────────────────────────────────────────
  "cart.title": "Votre panier",
  "cart.empty": "Votre panier est vide",
  "cart.emptyBody": "Rien pour l'instant. Trouvez ce qui vous plaît.",
  "cart.subtotal": "Sous-total",
  "cart.shipping": "Livraison",
  "cart.total": "Total",
  "cart.checkout": "Commander",
  "cart.continueShopping": "Continuer mes achats",
  "cart.remove": "Retirer",
  "cart.freeShipping": "Offerte",
  "cart.payingAs": "Commande en tant que",
  "cart.guestPrompt": "Connectez-vous pour réutiliser vos informations.",

  // ── Checkout ───────────────────────────────────────────────────────
  "checkout.title": "Commande",
  "checkout.contact": "Contact",
  "checkout.shippingAddress": "Adresse de livraison",
  "checkout.payment": "Paiement",
  "checkout.placeOrder": "Valider la commande",
  "checkout.email": "E-mail",
  "checkout.fullName": "Nom complet",
  "checkout.phone": "Téléphone",
  "checkout.address1": "Adresse",
  "checkout.address2": "Appartement, étage (facultatif)",
  "checkout.city": "Ville",
  "checkout.postcode": "Code postal",
  "checkout.country": "Pays",
  "checkout.notes": "Remarques sur la commande",

  // ── Account ────────────────────────────────────────────────────────
  "account.overview": "Aperçu",
  "account.myAccount": "Mon compte",
  "account.myOrders": "Mes commandes",
  "account.myDetails": "Mes informations",
  "account.details": "Détails",
  "account.signInTitle": "Connexion",
  "account.signUpTitle": "Créer votre compte",
  "account.signInSubtitle": "Connectez-vous pour suivre vos commandes et commander plus vite.",
  "account.signUpSubtitle": "Enregistrez vos informations pour une commande plus rapide.",
  "account.email": "E-mail",
  "account.password": "Mot de passe",
  "account.name": "Nom",
  "account.signInButton": "Se connecter",
  "account.signUpButton": "Créer un compte",
  "account.noAccount": "Pas encore de compte ?",
  "account.haveAccount": "Vous avez déjà un compte ?",
  "account.signOut": "Se déconnecter",
  "account.noOrders": "Aucune commande",
  "account.noOrdersBody": "Vos commandes apparaîtront ici.",
  "account.viewOrder": "Voir la commande",
  "account.personalDetails": "Informations personnelles",
  "account.signInInfo": "Informations de connexion",
  "account.profilePhoto": "Photo de profil",
  "account.addPhotoTitle": "Ajouter une photo de profil",
  "account.yourPhotoTitle": "Votre photo",
  "account.photoEmptyBody":
    "Vous n'apparaissez pour l'instant que par vos initiales. Ajoutez une photo et votre nom s'affichera avec votre visage sur tout le site.",
  "account.photoSetBody":
    "Voici comment vous apparaissez dans l'en-tête et sur votre compte. Remplacez-la quand vous le souhaitez.",
  "account.preferLater": "Vous préférez plus tard ?",
  "account.skipToOrders": "Passer à vos commandes",
  "account.saveChanges": "Enregistrer",
  "account.saved": "Enregistré",
  "account.totalOrders": "Commandes",
  "account.totalSpent": "Dépensé",
  "account.activeOrders": "En cours",
  "account.forgotPassword": "Mot de passe oublié ?",
  "account.comingSoon": "Bientôt disponible",

  // ── Order status ───────────────────────────────────────────────────
  "status.PENDING": "En attente",
  "status.PAID": "Payée",
  "status.SHIPPED": "Expédiée",
  "status.DELIVERED": "Livrée",
  "status.CANCELLED": "Annulée",
  "status.REFUNDED": "Remboursée",
  "status.EXPIRED": "Expirée",

  // ── Newsletter / footer ────────────────────────────────────────────
  "newsletter.submit": "S'inscrire",
  "newsletter.emailPlaceholder": "Adresse e-mail",
  "footer.help": "Aide",
  "footer.shop": "Boutique",
  "footer.follow": "Suivre",
  "footer.contact": "Contact",
  "footer.rights": "Tous droits réservés.",
  "footer.allProducts": "Tous les produits",
  "footer.about": "À propos de RAV3S",
  "footer.deliveryReturns": "Livraison et retours",
  "footer.callUs": "Appelez-nous",
  "footer.paymentNote":
    "Payez par MTN MoMo, Airtel Money, Tigo Cash ou carte. Livraison partout à Kigali.",

  // ── Generic ────────────────────────────────────────────────────────
  "common.loading": "Chargement",
  "common.error": "Une erreur est survenue",
  "common.retry": "Réessayer",
  "common.close": "Fermer",
  "common.cancel": "Annuler",
  "common.save": "Enregistrer",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.back": "Retour",
  "common.optional": "facultatif",
  "common.required": "obligatoire",
  "common.go": "Valider",

  // ── Admin chrome ───────────────────────────────────────────────────
  "admin.title": "Admin",
  "admin.overview": "Aperçu",
  "admin.products": "Produits",
  "admin.orders": "Commandes",
  "admin.siteEditor": "Éditeur du site",
  "admin.dashboard": "Tableau de bord",
  "admin.catalogue": "Catalogue",
  "admin.fulfilment": "Préparation",
  "admin.newProduct": "Nouveau produit",
  "admin.editSite": "Modifier le site",
  "admin.recentOrders": "Commandes récentes",
  "admin.lowStock": "Stock faible",
  "admin.viewAll": "Tout voir",
  "admin.restock": "Réapprovisionner",
  "admin.viewSite": "Voir le site",
  "admin.viewLive": "Voir en ligne",
  "admin.signOut": "Déconnexion",
  "admin.signedInAs": "Connecté en tant que",
  "admin.staySignedIn": "Rester connecté",
  "admin.revenue": "Chiffre d'affaires",
  "admin.paidOrders": "Commandes payées",
  "admin.paid": "payées",
  "admin.inCatalogue": "Dans le catalogue",
  "admin.subscribers": "Abonnés",
  "admin.newsletter": "Newsletter",
  "admin.searchProducts": "Rechercher un article",
  "admin.filter": "Filtrer",
  "admin.save": "Enregistrer",
  "admin.status": "Statut",
  "admin.items": "Articles",
  "admin.item": "article",
  "admin.subtotal": "Sous-total",
  "admin.shipping": "Livraison",
  "admin.total": "Total",
  "admin.variants": "Variantes",
  "admin.stockByVariant": "Stock par variante",
  "admin.stock": "Stock",
  "admin.set": "Définir",
  "admin.left": "restants",
  "admin.low": "faible",
  "admin.featured": "En vedette",
  "admin.hide": "Masquer",
  "admin.show": "Afficher",
  "admin.hidden": "Masqué",
  "admin.changePassword": "Changer le mot de passe admin",
  "admin.currentPassword": "Mot de passe actuel",
  "admin.newPassword": "Nouveau mot de passe (10+ caractères, une lettre et un chiffre)",
  "admin.confirmPassword": "Confirmer le nouveau mot de passe",
  "admin.everythingInOnePlace": "Tout au même endroit",
  "admin.noOrders": "Aucune commande pour l'instant.",
  "admin.noOrdersHere": "Aucune commande ici.",
  "admin.allStocked": "Tous les stocks sont corrects.",
  "admin.paymentsNotConnected": "Les paiements ne sont pas encore connectés",
  "admin.lowStockWarning": "{count} variante en stock faible",
  "admin.lowStockWarningPlural": "{count} variantes en stock faible",
  "admin.signOutTitle": "Se déconnecter de l'admin ?",
  "admin.signOutBody":
    "Votre session se terminera immédiatement. Vous aurez besoin du mot de passe admin pour gérer les produits, les commandes et les réglages.",

  // ── Accueil ────────────────────────────────────────────────────────
  "home.scrollRail": "Faites défiler le rail",
  "home.theDropLead": "La",
  "home.theDropWord": "sélection",
  "home.orderOnline": "Commander en ligne",
  "home.orderOnlineArrow": "Commander en ligne →",
  "home.noProducts":
    "Aucun produit pour le moment. Ajoutez-en depuis le tableau de bord.",
  "home.view": "Voir",
  "home.shopByCategory": "Acheter par catégorie",
  "home.readStory": "Notre histoire",
  "home.shopLabel": "Découvrir la marque",
  "home.inTheWild": "Dans la nature",
  "home.lookbook": "Lookbook",
  "home.preferToTalk": "Vous préférez parler ?",
  "home.orderOnWhatsapp": "Commander sur WhatsApp",
  "home.whatsappBody":
    "Envoyez-nous un message avec votre taille et votre couleur. Nous confirmons le stock et organisons la livraison à Kigali.",
  "home.chatWithUs": "Discutez avec nous",
  "home.scroll": "Défiler",

  // ── Liste des produits ─────────────────────────────────────────────
  "shop.all": "Tout",
  "shop.nothingTitle": "Rien ici pour l'instant",
  "shop.nothingBody":
    "Essayez une autre catégorie ou effacez votre recherche.",
  "shop.showEverything": "Tout afficher",

  // ── Fiche produit (compléments) ────────────────────────────────────
  "product.home": "Accueil",
  "product.wornByModel": "Porté par un mannequin",
  "product.scrollLabel": "Défiler",
  "product.garmentAlt": "{name} seul, vue {n}",
  "product.wornAlt": "{name} porté par un mannequin, vue {n}",
  "product.freeShippingOver": "Livraison offerte dès {amount} d'achat",
  "product.freeShippingMin": "Livraison offerte dès le montant minimum",
  "product.returns": "Retours sous 30 jours pour les articles non portés",
  "product.smallBatch": "Petites séries, conçues pour s'épuiser",
  "product.soldOut": "Épuisé",
  "product.addedToBag": "Ajouté au panier",
  "product.decreaseQty": "Diminuer la quantité",
  "product.increaseQty": "Augmenter la quantité",
  "product.onlyLeftIn": "Plus que {count} en {size} / {colour}",
  "product.addedViewBag": "Ajouté.",
  "product.viewBag": "Voir le panier",

  // ── Panier (détails) ───────────────────────────────────────────────
  "cart.startShopping": "Commencer vos achats",
  "cart.productCol": "Produit",
  "cart.quantityCol": "Quantité",
  "cart.totalCol": "Total",
  "cart.each": "{amount} l'unité",
  "cart.decreaseOf": "Diminuer la quantité de {name}",
  "cart.increaseOf": "Augmenter la quantité de {name}",
  "cart.removeName": "Retirer {name}",
  "cart.clearBag": "Vider le panier",
  "cart.approveTitle": "Validez votre paiement",
  "cart.checkPhone": "Consultez votre téléphone et validez le paiement.",
  "cart.waitingApprove":
    "En attente de votre validation sur votre téléphone...",
  "cart.selfUpdate":
    "Cette page se met à jour automatiquement dès que le paiement arrive.",
  "cart.fullName": "Nom complet",
  "cart.phone": "Téléphone (0788 000 000)",
  "cart.emailOptional": "E-mail (facultatif)",
  "cart.email": "E-mail",
  "cart.change": "Modifier",
  "cart.payAs": "Paiement par",
  "cart.haveAccount": "Vous avez un compte ?",
  "cart.signInFaster":
    "pour commander plus vite et conserver votre historique de commandes.",
  "cart.paymentMethod": "Moyen de paiement",
  "cart.onlineNotConfigured":
    "Le paiement en ligne n'est pas encore configuré. Commandez sur WhatsApp et nous mettrons les détails au point avec vous.",
  "cart.delivery": "Livraison",
  "cart.awayFromFree": "Encore {amount} pour la livraison offerte",
  "cart.unlockedFree": "Vous avez débloqué la livraison offerte",
  "cart.startingPayment": "Démarrage du paiement...",
  "cart.payNow": "Payer",
  "cart.payNote":
    "Payez par MTN MoMo, Airtel Money, Tigo Cash ou carte bancaire internationale.",
  "cart.method.paypack.label": "MTN MoMo / Airtel Money",
  "cart.method.paypack.hint":
    "Nous envoyons une demande sur votre téléphone. Validez-la pour payer.",
  "cart.method.flutterwave.label": "Carte / Mobile Money",
  "cart.method.flutterwave.hint":
    "Visa, Mastercard ou mobile money via Flutterwave.",
  "cart.method.stripe.label": "Carte internationale",
  "cart.method.stripe.hint":
    "Apple Pay, Google Pay et cartes du monde entier.",
  "cart.errStart": "Impossible de lancer le paiement.",
  "cart.errNoLink": "Le service de paiement n'a pas renvoyé de lien.",
  "cart.errGeneric": "Une erreur s'est produite.",

  // ── Pages de résultat de commande ───────────────────────────────────
  "checkout.successTitle": "Commande confirmée",
  "checkout.successBody":
    "Merci pour votre commande. Nous avons envoyé une confirmation par e-mail et nous vous écrirons dès l'expédition.",
  "checkout.order": "Commande",
  "checkout.shippingTo": "Livraison à",
  "checkout.confirming":
    "Nous confirmons toujours votre paiement. Vous recevrez un e-mail avec les détails de votre commande dans une minute — inutile de la repasser.",
  "checkout.keepShopping": "Continuer mes achats",
  "checkout.backHome": "Retour à l'accueil",
  "checkout.cancelledTitle": "Commande annulée",
  "checkout.cancelledBody":
    "Aucun montant n'a été débité et votre panier est exactement tel que vous l'avez laissé.",
  "checkout.returnToBag": "Retour au panier",

  // ── Page introuvable ───────────────────────────────────────────────
  "notFound.title": "Page introuvable",
  "notFound.body":
    "La page que vous cherchez n'existe pas ou a été déplacée.",
  "notFound.backHome": "Retour à l'accueil",
  "notFound.browse": "Voir la boutique",

  // ── À propos ───────────────────────────────────────────────────────
  "about.fabric": "La matière",
  "about.fabricBody":
    "Nous achetons le coton épais et la mérinos extra-fine au rouleau, pas au mètre, afin de pouvoir engager une série avant même la première commande.",
  "about.runs": "Les séries",
  "about.runsBody":
    "Les petites séries font vite place. Quand une pièce est épuisée, nous la réapprovisionnons, mais nous n'inflons jamais une série pour laisser croire que nous avons plus que ce que nous avons.",
  "about.promise": "L'engagement",
  "about.promiseBody":
    "30 jours pour changer d'avis sur tout article non porté, la livraison offerte au-delà de 120 $, et une vraie personne au bout de l'e-mail.",
  "about.workshopAlt": "Dans l'atelier RAV3S",

  // ── Contact ────────────────────────────────────────────────────────
  "contact.kicker": "Nous contacter",
  "contact.title": "Contact",
  "contact.body":
    "Une question sur les tailles, une commande ou un retour ? Écrivez-nous sur WhatsApp, appelez l'atelier ou envoyez un e-mail — une vraie personne répond sous un jour ouvré.",
  "contact.fastest": "Le plus rapide",
  "contact.whatsapp": "WhatsApp",
  "contact.workshop": "Atelier",
  "contact.callUs": "Appelez-nous",
  "contact.email": "E-mail",
  "contact.writeToUs": "Écrivez-nous",
  "contact.whereWeAre": "Où nous sommes",
  "contact.findWorkshop": "Trouver l'atelier",
  "contact.openInMaps": "Ouvrir dans Maps",
  "contact.followAlong": "Nous suivre",
  "contact.delivery": "Livraison",
  "contact.commonQuestions": "Questions fréquentes",
  "contact.q1": "Comment vos tailles tombent-elles ?",
  "contact.a1":
    "Fidèle à la taille, avec une coupe décontractée. Si vous êtes entre deux tailles et voulez une coupe ajustée, prenez une taille en dessous.",
  "contact.q2": "Quand ma commande sera-t-elle expédiée ?",
  "contact.a2":
    "Les commandes quittent l'atelier sous 2 jours ouvrés. Vous recevez une confirmation dès l'expédition.",
  "contact.q3": "Puis-je retourner un article ?",
  "contact.a3":
    "Oui, sous 30 jours, à condition qu'il n'ait pas été porté et que ses étiquettes soient encore présentes.",

  // ── Livraison ──────────────────────────────────────────────────────
  "shipping.kicker": "Conditions",
  "shipping.title": "Livraison et retours",
  "shipping.heading": "Livraison",
  "shipping.flatRate": "Forfait :",
  "shipping.freeOver": "Livraison offerte au-delà de",
  "shipping.leaves": "Les commandes quittent l'atelier sous 2 jours ouvrés.",
  "shipping.tracked":
    "Livraison suivie, 3 à 6 jours ouvrés après expédition.",
  "shipping.returnsHeading": "Retours",
  "shipping.returns30":
    "30 jours après livraison pour tout article non porté avec ses étiquettes.",
  "shipping.emailFirst":
    "Écrivez-nous d'abord afin que nous puissions vous envoyer une étiquette de retour.",
  "shipping.refunds":
    "Les remboursements arrivent sur votre moyen de paiement d'origine sous 5 jours ouvrés.",
  "shipping.saleItems":
    "Les articles en promotion et les articles percés ne sont ni repris ni échangés.",
  "shipping.free": "Offerte",

  // ── Guide des tailles ───────────────────────────────────────────────
  "sizeGuide.kicker": "Mesures",
  "sizeGuide.title": "Guide des tailles",
  "sizeGuide.body":
    "Nos coupes sont décontractées. Mesurez votre t-shirt préféré et comparez aux chiffres ci-dessous — c'est bien plus fiable que de vous fier à votre taille habituelle.",
  "sizeGuide.size": "Taille",
  "sizeGuide.chest": "Poitrine",
  "sizeGuide.length": "Longueur",
  "sizeGuide.shoulder": "Épaules",
  "sizeGuide.footer":
    "Entre deux tailles et vous voulez une coupe plus ajustée ? Prenez une taille en dessous. Encore hésitant ? Écrivez-nous et nous mesurerons une pièce finie pour vous.",

  // ── Coquille compte ─────────────────────────────────────────────────
  "account.yourAccount": "Votre compte",
  "account.memberSince": "Membre depuis",
  "account.ordersPlaced": "Commandes passées",
  "account.inProgress": "En cours",
  "account.delivered": "Livrées",
  "account.lifetimeSpend": "Dépenses totales",
  "account.recentOrders": "Commandes récentes",
  "account.viewAllCount": "Tout voir ({count})",
  "account.noOrdersTitle": "Aucune commande",
  "account.noOrdersOverviewBody":
    "Dès que vous passez une commande, elle apparaît ici avec son statut, son suivi et tout ce qu'il faut pour la suivre.",
  "account.noOrdersHistoryBody":
    "Votre historique de commandes apparaîtra ici — chaque commande, son statut et son reçu, tant que le compte existe.",
  "account.browseRange": "Voir la collection",
  "account.needSomething": "Besoin d'aide ?",
  "account.help": "Aide",
  "account.yourDetails": "Vos informations",
  "account.detailsBody":
    "Mettez à jour votre photo et le nom qui figure sur vos commandes.",
  "account.detailsBodyEmpty":
    "Ajoutez une photo et le nom qui figure sur vos commandes.",
  "account.sizeGuideCardBody": "Les mesures de toutes nos coupes.",
  "account.shippingCardBody": "Délais, tarifs de livraison et retours.",
  "account.item": "article",
  "account.items": "articles",
  "account.profilePhotoBody":
    "Affichée à côté de votre nom dans l'en-tête et sur votre compte.",
  "account.personalDetailsBody":
    "Le nom défini ici est celui que nous imprimons sur votre commande et son étiquette de livraison.",
  "account.signInSection": "Connexion",
  "account.emailAddress": "Adresse e-mail",
  "account.emailNote":
    "C'est votre identifiant de connexion. La réinitialisation du mot de passe n'est pas encore disponible — contactez-nous si vous devez changer d'e-mail.",
  "account.accountSection": "Compte",
  "account.lastUpdated": "Dernière mise à jour",
  "account.session": "Session",
  "account.sessionBody":
    "La déconnexion met fin à cette session sur cet appareil uniquement.",
  "account.displayName": "Nom affiché",
  "account.saving": "Enregistrement...",
  "account.placed": "Passée le",
  "account.placedOnDate": "Passée le {date}",
  "account.freeDelivery": "Livraison offerte",
  "account.deliveryWithAmount": "Livraison {amount}",
  "account.viewDetails": "Voir les détails",
  "account.order": "Commande",
  "account.allOrders": "Toutes les commandes",
  "account.placedAt": "Passée le {date} à {time}",
  "account.awaiting": "En attente",
  "account.confirmed": "Confirmé",
  "account.free": "Gratuit",
  "account.done": "Terminé",
  "account.pending": "En attente",
  "account.timelinePlaced": "Passée",
  "account.timelinePaid": "Payée",
  "account.timelineShipped": "Expédiée",
  "account.timelineDelivered": "Livrée",
  "account.payment": "Paiement",
  "account.notConfirmed": "Pas encore confirmé.",
  "account.paymentConfirmed": "Paiement confirmé.",
  "account.referenceOnFile": "Référence enregistrée.",
  "account.needHelp": "Besoin d'aide ?",
  "account.quoteOrder":
    "Indiquez la commande {order} et nous prendrons le relais.",
  "account.contactUs": "Nous contacter",
  "account.continueShopping": "Continuer mes achats",
  "account.deliveryAddress": "Adresse de livraison",
  "account.stepPENDING":
    "Nous attendons la réception de votre paiement. Cette page se met à jour automatiquement.",
  "account.stepPAID": "Paiement reçu. Votre commande est en préparation.",
  "account.stepSHIPPED": "En route vers vous.",
  "account.stepDELIVERED": "Livrée. Merci pour votre commande.",
  "account.stepCANCELLED":
    "Cette commande a été annulée et rien n'a été débité.",
  "account.stepREFUNDED":
    "Cette commande a été remboursée sur votre moyen de paiement d'origine.",
  "account.stepOther": "Nous vous écrirons en cas de changement.",

  // ── Formulaire de connexion ────────────────────────────────────────
  "account.welcomeBack": "Content de vous revoir",
  "account.createAccountKicker": "Créer un compte",
  "account.signInKickerBody":
    "Connectez-vous pour suivre vos commandes et commander en un clic.",
  "account.signInHeroTitle": "Reprenez là où vous en étiez.",
  "account.joinRav3s": "Rejoignez RAV3S",
  "account.signUpKickerBody":
    "Un seul compte pour vos commandes, votre adresse de livraison et un accès anticipé à chaque drop. {min} caractères minimum.",
  "account.signUpHeroTitle": "Votre compte, votre historique.",
  "account.signingIn": "Connexion en cours...",
  "account.creatingAccount": "Création du compte...",
  "account.perkSignIn1": "Toutes vos commandes au même endroit, avec leur statut",
  "account.perkSignIn2":
    "Vos informations enregistrées — plus rien à ressaisir",
  "account.perkSignIn3": "Une commande en un clic",
  "account.perkSignUp1": "Suivez chaque commande du paiement à la livraison",
  "account.perkSignUp2":
    "Des informations enregistrées pour une commande en un clic",
  "account.perkSignUp3":
    "Un accès anticipé aux nouvelles drops et aux réassorts",
  "account.showPassword": "Afficher le mot de passe",
  "account.hidePassword": "Masquer le mot de passe",
  "account.fullName": "Nom complet",
  "account.namePlaceholder": "Tel qu'il doit apparaître sur votre colis",
  "account.emailPlaceholder": "vous@email.com",
  "account.passwordPlaceholderSignIn": "Votre mot de passe",
  "account.passwordPlaceholderSignUp": "Au moins {min} caractères",
  "account.confirmPlaceholder": "Saisissez-le à nouveau",
  "account.alreadyHave": "Vous avez déjà un compte ?",
  "account.noAccountYet": "Pas encore de compte ?",
  "account.createOne": "En créer un",
  "account.continueGuest": "Continuer en tant qu'invité",
  "account.avatarPreviewBody":
    "Les images carrées donnent le meilleur rendu. Choisissez un fichier pour l'aperçu, puis enregistrez.",
  "account.avatarChooseAnother": "Choisir une autre",
  "account.avatarReplace": "Remplacer la photo",
  "account.avatarUpload": "Envoyer une photo",
  "account.avatarUploading": "Envoi en cours.",
  "account.avatarSave": "Enregistrer la photo",
  "account.avatarDiscard": "Annuler",
  "account.avatarFormats": "JPEG, PNG, WebP ou AVIF, jusqu'à 4 Mo.",
  "account.avatarRemoving": "Suppression en cours.",
  "account.avatarRemove": "Supprimer la photo",

  // ── Newsletter (complément) ────────────────────────────────────────
  "newsletter.joining": "Inscription...",

  // ── Admin : formulaire produit ─────────────────────────────────────
  "adminForm.saved": "Enregistré.",
  "adminForm.basics": "Informations de base",
  "adminForm.name": "Nom",
  "adminForm.namePlaceholder": "T-shirt heavyweight",
  "adminForm.slug": "Identifiant d'URL",
  "adminForm.slugPlaceholder": "t-shirt-heavyweight",
  "adminForm.tagline": "Accroche",
  "adminForm.taglinePlaceholder": "Coton jersey 240 gsm",
  "adminForm.category": "Catégorie",
  "adminForm.categoryPlaceholder": "T-Shirts",
  "adminForm.badge": "Badge",
  "adminForm.badgeHint": "ex. Nouveau, Best-seller, Édition limitée",
  "adminForm.description": "Description",
  "adminForm.descriptionPlaceholder":
    "Qu'est-ce qui rend cette pièce digne d'être achetée ?",
  "adminForm.pricing": "Prix",
  "adminForm.price": "Prix",
  "adminForm.comparePrice": "Prix barré",
  "adminForm.comparePriceHint":
    "Affiché en barré. Facultatif.",
  "adminForm.images": "Images",
  "adminForm.imagesBody":
    "Le premier lot montre le vêtement seul. Le second montre le même vêtement porté par un mannequin — les clients font défiler pour voir comment il tombe.",
  "adminForm.garmentFlat": "Vêtement seul (plats)",
  "adminForm.garmentFlatHint":
    "Téléversez depuis votre ordinateur, collez une URL ou saisissez un chemin.",
  "adminForm.moreFlat": "Autres plats",
  "adminForm.moreFlatHint": "Angles supplémentaires facultatifs.",
  "adminForm.onModel": "Porté par un mannequin",
  "adminForm.onModelHint":
    "Affiché lorsque le client fait défiler la fiche produit.",
  "adminForm.variantsTitle": "Tailles, couleurs et stock",
  "adminForm.coloursPlaceholder": "Couleurs (Noir Encre, Volt)",
  "adminForm.colours": "Couleurs",
  "adminForm.sizesPlaceholder": "Tailles (S, M, L)",
  "adminForm.sizes": "Tailles",
  "adminForm.stockPlaceholder": "Stock",
  "adminForm.stockPerVariant": "Stock par variante",
  "adminForm.addGrid": "Ajouter la grille",
  "adminForm.add": "Ajouter",
  "adminForm.noVariants":
    "Aucune variante pour l'instant. Ajoutez des couleurs et des tailles ci-dessus.",
  "adminForm.colSize": "Taille",
  "adminForm.colColour": "Couleur",
  "adminForm.colColourFr": "Couleur (FR)",
  "adminForm.colourFrPlaceholder": "ex. Noir encre",
  "adminForm.colourFrForRow": "Couleur française de la ligne {n}",
  "adminForm.frenchTitle": "Version française",
  "adminForm.nameFrPlaceholder": "T-shirt lourd essentiel",
  "adminForm.frenchHint":
    "Ce que voient les visiteurs francophones. Laissez un champ vide pour reprendre l'anglais ci-dessus — les tailles et couleurs se traduisent dans le tableau plus bas.",
  "adminForm.colSwatch": "Nuancier",
  "adminForm.colStock": "Stock",
  "adminForm.colSku": "SKU",
  "adminForm.sizeForRow": "Taille de la ligne {n}",
  "adminForm.colourForRow": "Couleur de la ligne {n}",
  "adminForm.swatchForRow": "Nuancier de la ligne {n}",
  "adminForm.stockForRow": "Stock de la ligne {n}",
  "adminForm.skuForRow": "SKU de la ligne {n}",
  "adminForm.removeRow": "Supprimer la ligne {n}",
  "adminForm.autoSku": "auto",
  "adminForm.visible": "Visible dans la boutique",
  "adminForm.featureLanding": "Mettre en avant sur la page d'accueil",
  "adminForm.saving": "Enregistrement...",
  "adminForm.saveChanges": "Enregistrer les modifications",
  "adminForm.createProduct": "Créer le produit",

  // ── Admin : sélecteur d'images ─────────────────────────────────────
  "picker.removeMedia": "Supprimer {kind} {n}",
  "picker.video": "la vidéo",
  "picker.image": "l'image",
  "picker.main": "Principale",
  "picker.noVideo": "Aucune vidéo pour l'instant.",
  "picker.noImage": "Aucune image pour l'instant.",
  "picker.uploading": "Téléversement...",
  "picker.uploadVideo": "Téléverser une vidéo",
  "picker.uploadComputer": "Téléverser depuis l'ordinateur",
  "picker.clearAll": "Tout effacer",
  "picker.urlVideoPlaceholder":
    "Collez l'URL d'une vidéo (.mp4 / .webm), puis appuyez sur Entrée",
  "picker.urlImagePlaceholder":
    "Collez l'URL ou le chemin d'une image, puis appuyez sur Entrée",
  "picker.add": "Ajouter",
  "picker.uploadFailed": "Échec du téléversement.",

  // ── Admin : connexion ──────────────────────────────────────────────
  "adminLogin.signIn": "Connexion admin",
  "adminLogin.email": "E-mail",
  "adminLogin.password": "Mot de passe",
  "adminLogin.signingIn": "Connexion en cours...",
  "adminLogin.note":
    "Les sessions sont signées et httpOnly. Changez le mot de passe par défaut dans les réglages juste après votre première connexion.",

  // ── Admin : détail d'une commande ──────────────────────────────────
  "adminOrder.customer": "Client",
  "adminOrder.contact": "Contact",
  "adminOrder.fulfilment": "Préparation",
  "adminOrder.updateStatus": "Mettre à jour le statut",
  "adminOrder.items": "Articles",
  "adminOrder.backToOrders": "Retour aux commandes",
  "adminOrder.placedOn": "Passée le",
  "adminOrder.shippingAddress": "Adresse de livraison",
  "adminOrder.paymentReference": "Référence de paiement",

  // ── Admin : boîte de confirmation ──────────────────────────────────
  "adminConfirm.pleaseConfirm": "Veuillez confirmer",
  "adminConfirm.account": "Compte",
  "adminConfirm.working": "En cours...",
  "adminConfirm.confirm": "Confirmer",
  "adminConfirm.cancel": "Annuler",
  "adminConfirm.failed":
    "Cela n'a pas fonctionné. Veuillez réessayer.",

  // ── Noms accessibles des boutons-icônes ────────────────────────────
  "nav.closeAccountMenu": "Fermer le menu du compte",
  "account.sectionsAria": "Sections du compte",
  "home.railBack": "Faire défiler le rail vers l'arrière",
  "home.railForward": "Faire défiler le rail vers l'avant",
  "home.railResume": "Reprendre le défilement automatique",
  "home.railPauseAuto": "Mettre le défilement automatique en pause",
  "home.railPlay": "Lecture",
  "home.railPause": "Pause",
  "home.galleryStrip": "Bande photo défilante",
  "home.lookbookAlt": "Lookbook RAV3S",

  // ── Compte : derniers complements ──────────────────────────────────
  "account.subtotal": "Sous-total",
  "account.delivery": "Livraison",
  "account.total": "Total",

  // ── Newsletter : formulaire et réponses du serveur ──────────────────
  "newsletter.emailAddress": "Adresse e-mail",
  "newsletter.invalidEmail": "Veuillez saisir une adresse e-mail valide.",
  "newsletter.saveFailed":
    "Votre e-mail n'a pas pu être enregistré. Veuillez réessayer.",
  "newsletter.onList": "Vous êtes inscrit. Consultez votre boîte mail.",

  // ── Messages de validation et de succès ─────────────────────────────
  "error.enterName": "Veuillez saisir votre nom.",
  "error.enterEmail": "Veuillez saisir votre adresse e-mail.",
  "error.choosePassword": "Choisissez un mot de passe.",
  "error.passwordMismatch": "Les mots de passe ne correspondent pas.",
  "error.fixFields": "Veuillez corriger les champs signalés.",
  "error.createAccountFailed":
    "Le compte n'a pas pu être créé. Veuillez réessayer.",
  "error.emailTaken":
    "Un compte utilise déjà cet e-mail. Essayez plutôt de vous connecter.",
  "error.invalidEmail": "Veuillez saisir une adresse e-mail valide.",
  "error.emailAndPassword": "Veuillez saisir votre e-mail et votre mot de passe.",
  "error.badCredentials":
    "Cette combinaison e-mail / mot de passe n'est pas reconnue.",
  "error.signInAgain": "Veuillez vous reconnecter.",
  "error.choosePhoto": "Choisissez une photo à envoyer.",
  "error.photoTooLarge":
    "Cette photo dépasse 4 Mo. Veuillez en choisir une plus légère.",
  "error.photoType": "Utilisez une photo JPEG, PNG, WebP ou AVIF.",
  "error.photoSaveFailed":
    "Cette photo n'a pas pu être enregistrée. Veuillez en essayer une autre.",
  "error.weakPassword": "Ce mot de passe est trop faible.",
  "error.passwordShort": "Utilisez au moins {min} caractères.",
  "error.passwordLetter": "Incluez au moins une lettre.",
  "error.passwordNumber": "Incluez au moins un chiffre.",
  "success.detailsSaved": "Vos informations ont été enregistrées.",
  "success.photoUpdated": "Votre photo de profil a été mise à jour.",
  "success.photoRemoved": "Votre photo de profil a été supprimée.",
  "success.productSaved": "Produit enregistré.",
  "success.passwordUpdated": "Mot de passe mis à jour.",

  // ── Admin : complements ────────────────────────────────────────────
  "admin.noSubscribers": "Personne ne s'est inscrit pour l'instant.",
  "admin.connectStripe":
    "Ajoutez {key} à votre fichier .env, puis redémarrez le site pour accepter les paiements par carte.",
  "admin.wrongCurrentPassword": "Votre mot de passe actuel est incorrect.",
  "admin.newPasswordMismatch": "Les nouveaux mots de passe ne correspondent pas.",
  "admin.updatePassword": "Mettre à jour le mot de passe",
  "admin.updatingPassword": "Mise à jour...",
  "admin.productGone": "Ce produit n'existe plus.",
  "admin.duplicateSlug": "Ce slug ou ce SKU est déjà utilisé par un autre produit.",
  "admin.productSaveFailed": "Le produit n'a pas pu être enregistré.",
  "admin.imageProcessFailed": "Les images n'ont pas pu être traitées.",
  "adminLogin.enterBoth": "Veuillez saisir votre e-mail et votre mot de passe.",
  "adminLogin.badCredentials": "Ces identifiants ne sont pas reconnus.",
  "adminOrder.customerNote": "Message du client",
  "adminOrder.notPaid": "Pas encore payée",
  "adminOrder.saveStatus": "Enregistrer le statut",
  "adminOrder.shippingFree": "Offerte",
  "adminOrder.payment": "Paiement",
  "adminOrder.emailCustomer": "Écrire au client",
  "adminOrder.emailSubject": "Votre commande RAV3S {order}",
  "adminOrder.itemOne": "1 article",
  "adminOrder.itemMany": "{count} articles",
  "admin.allStatuses": "Toutes",
  "admin.ordersFootnote":
    "Les montants sont en {currency}. Affichage des {count} commandes les plus récentes.",

  // ── Admin : validation du formulaire produit ────────────────────────
  "adminForm.nameRequired": "Donnez un nom au produit.",
  "adminForm.slugRequired": "Ajoutez un slug d'URL.",
  "adminForm.descriptionRequired": "Rédigez une description plus longue.",
  "adminForm.priceNegative": "Le prix ne peut pas être négatif.",
  "adminForm.categoryRequired": "Choisissez une catégorie.",
  "adminForm.imageRequired": "Ajoutez le chemin de l'image principale.",

  // ── Admin : titres et aides de l'éditeur du site ────────────────────
  "adminSet.brand": "Marque",
  "adminSet.brandHint": "Nom et logotype affichés sur tout le site.",
  "adminSet.colours": "Couleurs",
  "adminSet.livePreview": "Aperçu en direct",
  "adminSet.announcement": "Bandeau d'annonce",
  "adminSet.announcementHint": "La bande défilante tout en haut de la page.",
  "adminSet.hero": "Bannière de la page d'accueil",
  "adminSet.heroHint": "Ce que les visiteurs voient en premier.",
  "adminSet.videoLookbook": "Vidéo & lookbook",
  "adminSet.contactLocation": "WhatsApp, téléphone & adresse",
  "adminSet.addressPlaceholder": "KN 5 Ave, Kigali, Rwanda",
  "adminSet.mapPlaceholder": "https://www.google.com/maps/embed?pb=...",
  "adminSet.story": "Histoire de la marque",
  "adminSet.storyHint": "Le bloc « à propos » sur la page d'accueil.",
  "adminSet.valueProps": "Atouts & catégories",
  "adminSet.shopPage": "Page boutique",
  "adminSet.shopPageHint": "Titres de la liste des produits.",
  "adminSet.newsletter": "Inscription à la newsletter",
  "adminSet.newsletterHint": "Le bloc coloré près du pied de page.",
  "adminSet.footer": "Pied de page & contact",
  "adminSet.footerHint": "Réseaux sociaux et coordonnées.",
  "adminSet.shippingStock": "Livraison & stock",
  "adminSet.shippingStockHint":
    "Appliqué au paiement et aux alertes de l'administration.",
  "adminSet.warnHeroImage":
    "L'image de bannière n'a pas pu être traitée ; l'image par défaut a été conservée.",
  "adminSet.warnStoryImage":
    "L'image de l'histoire de la marque n'a pas pu être traitée ; l'image par défaut a été conservée.",
  "adminSet.warnGalleryImage":
    "Une ou plusieurs images de la bande défilante n'ont pas pu être traitées et ont été ignorées.",
  "adminSet.warnVideoPoster":
    "L'affiche de la vidéo n'a pas pu être traitée et a été effacée.",
  "adminSet.warnHeroVideo":
    "La vidéo de bannière n'a pas pu être traitée et a été effacée.",
  "adminSet.introBody":
    "Chaque titre, couleur, image et règle de cette page est modifiable et s'applique à tout le site dès que vous enregistrez.",
  "adminSet.imagesNotAddedOne":
    "Enregistré, mais une image n'a pas été ajoutée",
  "adminSet.imagesNotAddedMany":
    "Enregistré, mais {count} images n'ont pas été ajoutées",
  "adminSet.savedLive": "Site mis à jour. Vos modifications sont en ligne.",
  "adminSet.coloursHint":
    "Elles pilotent tous les boutons, badges et mises en avant du site.",
  "adminSet.videoLookbookHint":
    "Ajoutez une vidéo à la bannière et des photos à la bande défilante et au lookbook.",
  "adminSet.contactLocationHint":
    "Le bouton flottant WhatsApp, le bloc de contact du pied de page et la carte Google.",
  "adminSet.valuePropsHint":
    "Un élément par ligne. Les catégories alimentent les filtres de la boutique.",
  "adminSet.previewPrimary": "Principal",
  "adminSet.previewAccent": "Accent",
  "adminSet.previewHighlight": "Mise en avant",
  "adminSet.previewMuted": "Texte d'appui discret",
  "adminSet.colourPicker": "Sélecteur de couleur {name}",
  "adminSet.siteName": "Nom du site",
  "adminSet.tagline": "Slogan",
  "adminSet.logoText": "Texte du logo",
  "adminSet.logoMark": "Symbole du logo",
  "adminSet.ink": "Encre",
  "adminSet.bone": "Os",
  "adminSet.volt": "Volt",
  "adminSet.clay": "Argile",
  "adminSet.haze": "Brume",
  "adminSet.showAnnouncement": "Afficher la barre d'annonce",
  "adminSet.announcementText": "Texte de l'annonce",
  "adminSet.kicker": "Sur-titre",
  "adminSet.heroImage": "Image de bannière",
  "adminSet.heroImageHint":
    "Téléversez depuis votre ordinateur ou collez une URL. Une URL distante est téléchargée dans le projet à l'enregistrement.",
  "adminSet.heroFit": "Ajustement de l'image de bannière",
  "adminSet.heroFitHint":
    "Ajuster (photo entière) laisse des bandes noires lorsque la photo n'a pas la forme de l'écran. Remplir occupe tout l'espace mais coupe les bords.",
  "adminSet.heroFitContain": "Ajuster — montrer toute la photo (sans recadrage)",
  "adminSet.heroFitCover": "Remplir — couvrir l'écran en coupant les bords",
  "adminSet.headline": "Titre principal",
  "adminSet.supportingCopy": "Texte d'appui",
  "adminSet.buttonText": "Texte du bouton",
  "adminSet.buttonLink": "Lien du bouton",
  "adminSet.secondaryButtonText": "Texte du bouton secondaire",
  "adminSet.secondaryButtonLink": "Lien du bouton secondaire",
  "adminSet.heroVideo": "Vidéo de bannière",
  "adminSet.heroVideoHint":
    "Choisissez un fichier depuis votre ordinateur, ou collez une URL se terminant par .mp4 ou .webm. Laissez vide pour utiliser l'image de bannière. Nous recommandons un clip de 10 à 20 secondes.",
  "adminSet.videoPoster": "Affiche de la vidéo",
  "adminSet.videoPosterHint":
    "Affichée avant le démarrage de la vidéo. Laissez vide pour utiliser l'image de bannière.",
  "adminSet.galleryImages": "Bande de photos défilante sur la page d'accueil",
  "adminSet.galleryImagesHint":
    "Ajoutez plusieurs images ici — elles apparaissent dans la rangée qui défile horizontalement juste sous la bannière. Sélectionnez plusieurs fichiers à la fois, puis appuyez sur Enregistrer. Les URL distantes sont téléchargées dans le projet à l'enregistrement.",
  "adminSet.showWhatsapp": "Afficher le bouton flottant WhatsApp",
  "adminSet.whatsappNumber": "Numéro WhatsApp",
  "adminSet.whatsappNumberHint":
    "Format local. L'indicatif du pays est ajouté automatiquement.",
  "adminSet.phoneNumber": "Numéro de téléphone",
  "adminSet.whatsappMessage": "Message WhatsApp pré-rempli",
  "adminSet.shopAddress": "Adresse / quartier de la boutique",
  "adminSet.shopAddressHint":
    "Utilisée pour placer la carte Google et le lien d'itinéraire.",
  "adminSet.mapEmbed": "URL d'intégration Google Maps",
  "adminSet.mapEmbedHint":
    "Facultatif. Dans Google Maps, choisissez Partager > Intégrer une carte et collez l'URL. Laissez vide pour rechercher l'adresse automatiquement.",
  "adminSet.instagramUrl": "URL Instagram",
  "adminSet.tiktokUrl": "URL TikTok",
  "adminSet.facebookUrl": "URL Facebook",
  "adminSet.storyImage": "Image de l'histoire",
  "adminSet.body": "Corps du texte",
  "adminSet.valuePropsLabel": "Atouts (bandeau mis en avant)",
  "adminSet.categories": "Catégories",
  "adminSet.shopHeading": "Titre de la boutique",
  "adminSet.shopDescription": "Description de la boutique",
  "adminSet.showNewsletter": "Afficher le bloc newsletter",
  "adminSet.aboutText": "Texte à propos",
  "adminSet.email": "E-mail",
  "adminSet.address": "Adresse",
  "adminSet.currencyCode": "Code devise",
  "adminSet.currencyCodeHint": "ex. rwf, usd, gbp",
  "adminSet.flatShipping": "Livraison forfaitaire",
  "adminSet.freeShippingOver": "Livraison offerte dès",
  "adminSet.lowStockAlert": "Alerte stock bas à",
  "adminSet.french": "Version française",
  "adminSet.frenchHint":
    "Les textes vus par les visiteurs francophones. Ce qui reste vide reprend le texte anglais ci-dessus.",
  "adminSet.frenchFallback":
    "Tous les champs français sont facultatifs. Laissez-en un vide et le texte anglais s'affiche à la place, ce qui permet de traduire progressivement sans laisser de trou sur le site.",
  "adminSet.frenchOptional": "Facultatif",
  "adminSet.valuePropsFrHint":
    "Un par ligne, dans le même ordre que la liste anglaise. Une ligne vide conserve son élément anglais.",
  "adminSet.categoriesFrHint":
    "Un par ligne, dans le même ordre que la liste anglaise. Ce sont les libellés affichés aux acheteurs ; les noms anglais restent les clés de filtre dans les liens.",
  "adminSet.frenchListOrder":
    "Les noms, descriptions et couleurs des produits se traduisent sur chaque fiche produit.",
  "adminSet.liveNote":
    "Les modifications sont appliquées à tout le site à l'enregistrement.",
  "adminSet.saving": "Enregistrement...",
  "adminSet.saveAll": "Enregistrer toutes les modifications",

  // ── Clés d'erreur des API ────────────────────────────────────────────
  // Les routes renvoie ces clés plutôt que des phrases : le navigateur les
  // traduit ensuite dans la langue du lecteur.
  "api.phoneInvalid": "Saisissez un numéro de téléphone valide.",
  "api.emailInvalid": "Saisissez une adresse e-mail valide.",
  "api.nameRequired": "Saisissez votre nom complet.",
  "api.bagEmpty": "Votre panier est vide.",
  "api.invalidBag": "Contenu du panier invalide.",
  "api.methodUnavailable":
    "Ce moyen de paiement n'est pas encore disponible. Veuillez en essayer un autre.",
  "api.itemUnavailable":
    "Un article de votre panier n'est plus disponible.",
  "api.stripeNotConfigured":
    "Le paiement par carte n'est pas encore configuré.",
  "api.paymentFailed": "La demande de paiement a échoué.",
  "api.freeDelivery": "Livraison offerte",
  "api.standardDelivery": "Livraison standard",
  "upload.unauthorized": "Vous n'êtes pas connecté en tant qu'administrateur.",
  "upload.expectedFile": "Un fichier était attendu.",
  "upload.noFile": "Aucun fichier n'a été fourni.",
  "upload.emptyFile": "Ce fichier est vide.",
  "upload.imageTooLarge":
    "Cette image dépasse 6 Mo. Veuillez la compresser d'abord.",
  "upload.videoTooLarge":
    "Cette vidéo dépasse 40 Mo. Veuillez la compresser d'abord.",
  "upload.badImageType":
    "Type de fichier non pris en charge. Utilisez JPEG, PNG, WebP, AVIF ou GIF.",
  "upload.badVideoType":
    "Type de vidéo non pris en charge. Utilisez MP4, WebM, MOV ou OGG.",
  "upload.saveFailed":
    "Impossible d'enregistrer le fichier. Vérifiez les autorisations du dossier.",

// ── Interface : carte + thème ────────────────────────────────────────
  "about.meta": "À propos",
  "cart.meta": "Votre panier",
  "checkout.successMeta": "Commande confirmée",
  "checkout.cancelledMeta": "Paiement annulé",
  "contact.meta": "Contact",
  "shop.meta": "Boutique",
  "admin.metaOverview": "Aperçu",
  "admin.metaProducts": "Produits",
  "admin.metaEditProduct": "Modifier le produit",
  "admin.metaOrders": "Commandes",
  "admin.metaOrder": "Commande",
  "admin.metaSettings": "Éditeur du site",
  "map.title": "Notre adresse",
  "map.brandLocation": "Adresse de {name}",
  "map.directions": "Obtenir l'itinéraire",
  "theme.toLight": "Passer en mode clair",
  "theme.toDark": "Passer en mode sombre",
  "theme.lightMode": "Mode clair",
  "theme.darkMode": "Mode sombre",
  "theme.light": "Clair",
  "theme.dark": "Sombre",

  // ── Écran du forfait (/plan-expired) ────────────────────────────────
  "plan.actionRequired": "Action requise",
  "plan.actionBody":
    "Votre espace de travail utilise le forfait Gratuit. Les forfaits gratuits n'ont pas d'abonnement payant derrière eux : il existe donc un délai de grâce avant la mise en pause du service.",
  "plan.title": "Votre forfait gratuit arrive à son terme",
  "plan.intro":
    "Le compte à rebours ci-dessous est envoyé par notre serveur. Lorsqu'il atteint zéro, votre service est mis en pause automatiquement — rien n'est supprimé et aucune somme n'est débitée sans votre accord. La mise à niveau prend environ une minute et réactive le service immédiatement.",
  "plan.timerLabel": "Temps restant avant la mise en pause du service",
  "plan.windowUsed": "{percent} % de votre délai de grâce utilisé",
  "plan.windowEnded": "Votre délai de grâce est terminé.",
  "plan.timerAria": "Temps restant avant la mise en pause du service",
  "plan.pauseHeading": "Ce qui se passe à zéro",
  "plan.upgradeHeading": "Ce que comprend la mise à niveau",
  "plan.pause1":
    "Votre service cesse de répondre au trafic. Votre URL publique affiche une page d'erreur.",
  "plan.pause2":
    "Rien n'est supprimé. Votre code, votre base de données et vos variables d'environnement sont intégralement conservés.",
  "plan.pause3":
    "Aucun paiement n'est prélevé automatiquement. Vous n'êtes facturé que si vous choisissez de mettre à niveau.",
  "plan.pause4":
    "Vous pouvez toujours vous connecter et gérer votre espace de travail pendant la pause.",
  "plan.upgrade1": "Un service toujours actif — aucune mise en veille, aucun démarrage à froid",
  "plan.upgrade2": "Votre propre nom de domaine avec TLS géré",
  "plan.upgrade3": "Sauvegardes automatiques quotidiennes avec restauration en un clic",
  "plan.upgrade4":
    "Assistance e-mail avec un délai de réponse garanti, et non indicatif",
  "plan.paidPlan": "Forfait payant",
  "plan.priceNote":
    "Par mois. Annulez à tout moment depuis la même page — sans engagement ni durée minimale.",
  "plan.cta": "Mettre à niveau et rester en ligne",
  "plan.disclaimer":
    "Ce compte à rebours est émis par notre serveur et ne repart pas de zéro lors d'un rechargement. La mise en pause s'applique à l'heure indiquée ci-dessus ; si elle est déjà passée, le service redémarre dès que le paiement est validé.",
  "plan.support": "Contacter le support",
  "plan.supportMessage":
    "Bonjour - mon délai de grâce pour le forfait gratuit arrive à son terme. Pouvez-vous m'aider à mettre à niveau ?",
  "plan.servicePaused": "Votre service a été mis en pause.",
  "plan.windowEndsAt": "Votre délai de grâce se termine {when}.",
  "plan.days": "Jours",
  "plan.hours": "Heures",
  "plan.minutes": "Minutes",
  "plan.seconds": "Secondes",
};
